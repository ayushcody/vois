// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AdminRoles
/// @notice Simple, robust admin role manager for EkMat.
///         - Deployer is initial admin
///         - Tracks admin count
///         - Prevents removal of the last admin
contract AdminRoles {
    // -----------
    // Errors
    // -----------

    error NotAdmin();
    error ZeroAddress();
    error AlreadyAdmin();
    error NotAdminAccount();
    error LastAdminRemovalForbidden();

    // -----------
    // State
    // -----------

    mapping(address => bool) public isAdmin;
    uint256 public adminCount;

    // -----------
    // Events
    // -----------

    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);

    // -----------
    // Modifiers
    // -----------

    modifier onlyAdmin() {
        if (!isAdmin[msg.sender]) revert NotAdmin();
        _;
    }

    constructor() {
        isAdmin[msg.sender] = true;
        adminCount = 1;
        emit AdminAdded(msg.sender);
    }

    /// @notice Grant admin rights to an address.
    function addAdmin(address account) external onlyAdmin {
        if (account == address(0)) revert ZeroAddress();
        if (isAdmin[account]) revert AlreadyAdmin();

        isAdmin[account] = true;
        adminCount += 1;
        emit AdminAdded(account);
    }

    /// @notice Remove admin rights from an address.
    /// @dev Will not allow removing the final remaining admin.
    function removeAdmin(address account) external onlyAdmin {
        if (!isAdmin[account]) revert NotAdminAccount();
        if (adminCount <= 1) revert LastAdminRemovalForbidden();

        isAdmin[account] = false;
        adminCount -= 1;
        emit AdminRemoved(account);
    }
}