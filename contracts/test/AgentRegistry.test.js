const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentRegistry", function () {
  let agentRegistry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();
    await agentRegistry.waitForDeployment();
  });

  describe("Agent Registration", function () {
    it("Should register a new agent", async function () {
      const metadataCID = "QmTest123";
      const publicKey = ethers.hexlify(ethers.randomBytes(32));
      const role = 0; // Buyer

      await expect(
        agentRegistry.connect(addr1).registerAgent(metadataCID, publicKey, role)
      )
        .to.emit(agentRegistry, "AgentRegistered")
        .withArgs(1, addr1.address, metadataCID, role, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      const agent = await agentRegistry.getAgent(1);
      expect(agent.owner).to.equal(addr1.address);
      expect(agent.metadataCID).to.equal(metadataCID);
      expect(agent.status).to.equal(1); // Active
    });

    it("Should fail to register with empty metadata", async function () {
      const publicKey = ethers.hexlify(ethers.randomBytes(32));
      await expect(
        agentRegistry.connect(addr1).registerAgent("", publicKey, 0)
      ).to.be.revertedWith("Metadata CID required");
    });

    it("Should track multiple agents per owner", async function () {
      const publicKey = ethers.hexlify(ethers.randomBytes(32));
      
      await agentRegistry.connect(addr1).registerAgent("QmTest1", publicKey, 0);
      await agentRegistry.connect(addr1).registerAgent("QmTest2", publicKey, 1);

      const ownerAgents = await agentRegistry.getOwnerAgents(addr1.address);
      expect(ownerAgents.length).to.equal(2);
    });
  });

  describe("Agent Updates", function () {
    beforeEach(async function () {
      const publicKey = ethers.hexlify(ethers.randomBytes(32));
      await agentRegistry.connect(addr1).registerAgent("QmTest", publicKey, 0);
    });

    it("Should update agent metadata", async function () {
      const newCID = "QmNewTest";
      await expect(
        agentRegistry.connect(addr1).updateAgentMetadata(1, newCID)
      ).to.emit(agentRegistry, "AgentUpdated");

      const agent = await agentRegistry.getAgent(1);
      expect(agent.metadataCID).to.equal(newCID);
    });

    it("Should fail to update if not owner", async function () {
      await expect(
        agentRegistry.connect(addr2).updateAgentMetadata(1, "QmNew")
      ).to.be.revertedWith("Not agent owner");
    });

    it("Should deactivate agent", async function () {
      await expect(
        agentRegistry.connect(addr1).deactivateAgent(1)
      ).to.emit(agentRegistry, "AgentDeactivated");

      const agent = await agentRegistry.getAgent(1);
      expect(agent.status).to.equal(3); // Deactivated
    });
  });

  describe("Transaction Recording", function () {
    beforeEach(async function () {
      const publicKey = ethers.hexlify(ethers.randomBytes(32));
      await agentRegistry.connect(addr1).registerAgent("QmTest", publicKey, 0);
    });

    it("Should record transactions", async function () {
      await agentRegistry.recordTransaction(1);
      await agentRegistry.recordTransaction(1);

      const agent = await agentRegistry.getAgent(1);
      expect(agent.transactionCount).to.equal(2);
    });
  });

  describe("Reputation Management", function () {
    beforeEach(async function () {
      const publicKey = ethers.hexlify(ethers.randomBytes(32));
      await agentRegistry.connect(addr1).registerAgent("QmTest", publicKey, 0);
    });

    it("Should update reputation score", async function () {
      await expect(
        agentRegistry.updateReputation(1, 500)
      ).to.emit(agentRegistry, "ReputationUpdated");

      const agent = await agentRegistry.getAgent(1);
      expect(agent.reputationScore).to.equal(500);
    });

    it("Should fail with invalid score", async function () {
      await expect(
        agentRegistry.updateReputation(1, 1001)
      ).to.be.revertedWith("Score must be <= 1000");
    });
  });

  describe("View Functions", function () {
    it("Should return total agents", async function () {
      const publicKey = ethers.hexlify(ethers.randomBytes(32));
      await agentRegistry.connect(addr1).registerAgent("QmTest1", publicKey, 0);
      await agentRegistry.connect(addr2).registerAgent("QmTest2", publicKey, 1);

      const total = await agentRegistry.getTotalAgents();
      expect(total).to.equal(2);
    });

    it("Should check if agent is active", async function () {
      const publicKey = ethers.hexlify(ethers.randomBytes(32));
      await agentRegistry.connect(addr1).registerAgent("QmTest", publicKey, 0);

      expect(await agentRegistry.isAgentActive(1)).to.be.true;

      await agentRegistry.connect(addr1).deactivateAgent(1);
      expect(await agentRegistry.isAgentActive(1)).to.be.false;
    });
  });
});
