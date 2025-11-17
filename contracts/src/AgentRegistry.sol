// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentRegistry
 * @notice ERC-8004 compatible Agent Identity Registry for VERA marketplace
 * @dev Manages autonomous agent identities with on-chain verification
 */
contract AgentRegistry is Ownable, ReentrancyGuard {
    
    /// @notice Agent status enumeration
    enum AgentStatus { Inactive, Active, Suspended, Deactivated }
    
    /// @notice Agent role enumeration
    enum AgentRole { Buyer, Seller, Both }
    
    /// @notice Agent identity structure
    struct Agent {
        uint256 agentId;
        address owner;
        string metadataCID;
        bytes publicKey;
        AgentRole role;
        AgentStatus status;
        uint256 registeredAt;
        uint256 updatedAt;
        uint256 transactionCount;
        uint256 reputationScore;
    }
    
    /// @notice Agent ID counter
    uint256 private _agentIdCounter;
    
    /// @notice Mapping from agent ID to Agent struct
    mapping(uint256 => Agent) public agents;
    
    /// @notice Mapping from owner address to agent IDs
    mapping(address => uint256[]) public ownerAgents;
    
    /// @notice Mapping from agent ID to owner address
    mapping(uint256 => address) public agentOwner;
    
    /// @notice Events
    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string metadataCID,
        AgentRole role,
        uint256 timestamp
    );
    
    event AgentUpdated(
        uint256 indexed agentId,
        string newMetadataCID,
        uint256 timestamp
    );
    
    event AgentDeactivated(
        uint256 indexed agentId,
        uint256 timestamp
    );
    
    event AgentStatusChanged(
        uint256 indexed agentId,
        AgentStatus oldStatus,
        AgentStatus newStatus,
        uint256 timestamp
    );
    
    event TransactionRecorded(
        uint256 indexed agentId,
        uint256 transactionCount,
        uint256 timestamp
    );
    
    event ReputationUpdated(
        uint256 indexed agentId,
        uint256 oldScore,
        uint256 newScore,
        uint256 timestamp
    );
    
    constructor() Ownable(msg.sender) {
        _agentIdCounter = 1;
    }
    
    /**
     * @notice Register a new agent
     * @param _metadataCID IPFS CID containing agent metadata
     * @param _publicKey Agent's public key for signature verification
     * @param _role Agent role (Buyer, Seller, or Both)
     * @return agentId The newly created agent ID
     */
    function registerAgent(
        string calldata _metadataCID,
        bytes calldata _publicKey,
        AgentRole _role
    ) external nonReentrant returns (uint256) {
        require(bytes(_metadataCID).length > 0, "Metadata CID required");
        require(_publicKey.length > 0, "Public key required");
        
        uint256 agentId = _agentIdCounter++;
        
        agents[agentId] = Agent({
            agentId: agentId,
            owner: msg.sender,
            metadataCID: _metadataCID,
            publicKey: _publicKey,
            role: _role,
            status: AgentStatus.Active,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp,
            transactionCount: 0,
            reputationScore: 100
        });
        
        ownerAgents[msg.sender].push(agentId);
        agentOwner[agentId] = msg.sender;
        
        emit AgentRegistered(
            agentId,
            msg.sender,
            _metadataCID,
            _role,
            block.timestamp
        );
        
        return agentId;
    }
    
    /**
     * @notice Update agent metadata
     * @param _agentId Agent ID to update
     * @param _newMetadataCID New IPFS CID
     */
    function updateAgentMetadata(
        uint256 _agentId,
        string calldata _newMetadataCID
    ) external {
        require(agentOwner[_agentId] == msg.sender, "Not agent owner");
        require(agents[_agentId].status != AgentStatus.Deactivated, "Agent deactivated");
        require(bytes(_newMetadataCID).length > 0, "Metadata CID required");
        
        agents[_agentId].metadataCID = _newMetadataCID;
        agents[_agentId].updatedAt = block.timestamp;
        
        emit AgentUpdated(_agentId, _newMetadataCID, block.timestamp);
    }
    
    /**
     * @notice Deactivate an agent
     * @param _agentId Agent ID to deactivate
     */
    function deactivateAgent(uint256 _agentId) external {
        require(agentOwner[_agentId] == msg.sender, "Not agent owner");
        require(agents[_agentId].status != AgentStatus.Deactivated, "Already deactivated");
        
        AgentStatus oldStatus = agents[_agentId].status;
        agents[_agentId].status = AgentStatus.Deactivated;
        agents[_agentId].updatedAt = block.timestamp;
        
        emit AgentDeactivated(_agentId, block.timestamp);
        emit AgentStatusChanged(_agentId, oldStatus, AgentStatus.Deactivated, block.timestamp);
    }
    
    /**
     * @notice Change agent status (admin only)
     * @param _agentId Agent ID
     * @param _newStatus New status
     */
    function changeAgentStatus(
        uint256 _agentId,
        AgentStatus _newStatus
    ) external onlyOwner {
        require(agents[_agentId].agentId != 0, "Agent does not exist");
        
        AgentStatus oldStatus = agents[_agentId].status;
        agents[_agentId].status = _newStatus;
        agents[_agentId].updatedAt = block.timestamp;
        
        emit AgentStatusChanged(_agentId, oldStatus, _newStatus, block.timestamp);
    }
    
    /**
     * @notice Record a transaction for an agent
     * @param _agentId Agent ID
     */
    function recordTransaction(uint256 _agentId) external {
        require(agents[_agentId].agentId != 0, "Agent does not exist");
        require(agents[_agentId].status == AgentStatus.Active, "Agent not active");
        
        agents[_agentId].transactionCount++;
        agents[_agentId].updatedAt = block.timestamp;
        
        emit TransactionRecorded(
            _agentId,
            agents[_agentId].transactionCount,
            block.timestamp
        );
    }
    
    /**
     * @notice Update agent reputation score
     * @param _agentId Agent ID
     * @param _newScore New reputation score
     */
    function updateReputation(
        uint256 _agentId,
        uint256 _newScore
    ) external onlyOwner {
        require(agents[_agentId].agentId != 0, "Agent does not exist");
        require(_newScore <= 1000, "Score must be <= 1000");
        
        uint256 oldScore = agents[_agentId].reputationScore;
        agents[_agentId].reputationScore = _newScore;
        agents[_agentId].updatedAt = block.timestamp;
        
        emit ReputationUpdated(_agentId, oldScore, _newScore, block.timestamp);
    }
    
    /**
     * @notice Get agent details
     * @param _agentId Agent ID
     * @return Agent struct
     */
    function getAgent(uint256 _agentId) external view returns (Agent memory) {
        require(agents[_agentId].agentId != 0, "Agent does not exist");
        return agents[_agentId];
    }
    
    /**
     * @notice Get all agent IDs owned by an address
     * @param _owner Owner address
     * @return Array of agent IDs
     */
    function getOwnerAgents(address _owner) external view returns (uint256[] memory) {
        return ownerAgents[_owner];
    }
    
    /**
     * @notice Get total number of registered agents
     * @return Total agent count
     */
    function getTotalAgents() external view returns (uint256) {
        return _agentIdCounter - 1;
    }
    
    /**
     * @notice Check if agent is active
     * @param _agentId Agent ID
     * @return Boolean indicating if agent is active
     */
    function isAgentActive(uint256 _agentId) external view returns (bool) {
        return agents[_agentId].status == AgentStatus.Active;
    }
}
