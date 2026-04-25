import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Blockchain Logic ---

interface Transaction {
  senderName: string;
  senderAccount: string;
  senderHash: string; // Biometric Hash
  receiverName: string;
  receiverAccount: string;
  receiverHash: string; // Target Hash for receipt
  amountSent: number;
  amountReceived: number;
  currency: string;
  timestamp: string;
  id: string;
  confirmedByReceiver: boolean;
}

interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

class Blockchain {
  chain: Block[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock(): Block {
    return {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: "0",
      hash: "genesis_hash",
      nonce: 0,
    };
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  calculateHash(block: Omit<Block, "hash">): string {
    return crypto
      .createHash("sha256")
      .update(
        block.index +
          block.previousHash +
          block.timestamp +
          JSON.stringify(block.transactions) +
          block.nonce
      )
      .digest("hex");
  }

  mineBlock(newBlock: Omit<Block, "hash">): Block {
    let nonce = 0;
    while (true) {
      const hash = this.calculateHash({ ...newBlock, nonce });
      if (hash.substring(0, 2) === "00") { // Difficulty 2 for demo purposes
        return { ...newBlock, hash, nonce };
      }
      nonce++;
    }
  }

  addBlock(transactions: Transaction[]) {
    const previousBlock = this.getLatestBlock();
    const newBlockData: Omit<Block, "hash"> = {
      index: previousBlock.index + 1,
      timestamp: Date.now(),
      transactions: transactions,
      previousHash: previousBlock.hash,
      nonce: 0
    };
    const minedBlock = this.mineBlock(newBlockData);
    this.chain.push(minedBlock);
  }

  confirmTransaction(txId: string, biometricHash: string): boolean {
    for (const block of this.chain) {
      const tx = block.transactions.find(t => t.id === txId);
      if (tx) {
        if (tx.receiverHash === biometricHash) {
          tx.confirmedByReceiver = true;
          return true;
        }
      }
    }
    return false;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i - 1];

        if (currentBlock.hash !== this.calculateHash(currentBlock)) {
            return false;
        }

        if (currentBlock.previousHash !== previousBlock.hash) {
            return false;
        }
    }
    return true;
  }
}

const safeChain = new Blockchain();

// --- Express App Setup ---

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/blockchain", (req, res) => {
    res.json({
      chain: safeChain.chain,
      isValid: safeChain.isChainValid()
    });
  });

  app.post("/api/transaction", (req, res) => {
    const { transaction } = req.body;
    
    // In a real app, AI checks would happen before mining.
    // For this prototype, the client will call the AI (as per gemini-api skill rules: call from frontend)
    // and then send the transaction here if "approved".
    
    if (!transaction) {
      return res.status(400).json({ error: "No transaction data" });
    }

    const tx: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      currency: "UZS",
      confirmedByReceiver: false
    };

    safeChain.addBlock([tx]);
    res.json({ success: true, transaction: tx });
  });

  app.post("/api/confirm-receipt", (req, res) => {
    const { transactionId, biometricHash } = req.body;
    const success = safeChain.confirmTransaction(transactionId, biometricHash);

    if (success) {
      res.json({ success: true, message: "Mablag' qabul qilindi. Shaxsingiz tasdiqlandi." });
    } else {
      res.status(403).json({ success: false, message: "Biometrik ma'lumotlar mos kelmadi (V(b,h)=0)." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
