import React from 'react';
import ProposalItem from '../../components/ProposalItem';

const ProposalsTab = ({ proposals, proposalSortBy, setProposalSortBy, proposalSortOrder, setProposalSortOrder, onApprove, onReject, onEdit, onDelete }) => {
  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title">Card Proposals</h2>
      </div>

      <div className="sorting-controls" style={{ marginBottom: '1.5rem' }}>
        <div className="sort-group">
          <label htmlFor="proposalSortBy" className="sort-label">Sort by:</label>
          <select
            id="proposalSortBy"
            value={proposalSortBy}
            onChange={(e) => setProposalSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Submission Date</option>
            <option value="name">Name</option>
            <option value="birthYear">Birth Year</option>
            <option value="deathYear">Death Year</option>
            <option value="tier">Tier</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div className="sort-group">
          <label htmlFor="proposalSortOrder" className="sort-label">Order:</label>
          <select
            id="proposalSortOrder"
            value={proposalSortOrder}
            onChange={(e) => setProposalSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {proposals.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#e6d7c3', padding: '2rem' }}>
          No proposals found
        </p>
      ) : (
        <div>
          {proposals
            .sort((a, b) => {
              if (a.status === 'pending' && b.status !== 'pending') return -1;
              if (a.status !== 'pending' && b.status === 'pending') return 1;
              let aValue, bValue;
              switch (proposalSortBy) {
                case 'createdAt':
                  aValue = new Date(a.createdAt);
                  bValue = new Date(b.createdAt);
                  break;
                case 'name':
                  aValue = a.name.toLowerCase();
                  bValue = b.name.toLowerCase();
                  break;
                case 'birthYear':
                  aValue = a.birthYear || 0;
                  bValue = b.birthYear || 0;
                  break;
                case 'deathYear':
                  aValue = a.deathYear || 0;
                  bValue = b.deathYear || 0;
                  break;
                case 'tier':
                  const tierOrder = { 'Common': 1, 'Rare': 2, 'Epic': 3, 'Legendary': 4, 'Mythic': 5 };
                  aValue = tierOrder[a.tier] || 0;
                  bValue = tierOrder[b.tier] || 0;
                  break;
                case 'status':
                  aValue = a.status.toLowerCase();
                  bValue = b.status.toLowerCase();
                  break;
                default:
                  aValue = new Date(a.createdAt);
                  bValue = new Date(b.createdAt);
              }
              if (aValue < bValue) return proposalSortOrder === 'asc' ? -1 : 1;
              if (aValue > bValue) return proposalSortOrder === 'asc' ? 1 : -1;
              return 0;
            })
            .map(proposal => (
              <ProposalItem
                key={proposal.id}
                proposal={proposal}
                onApprove={() => onApprove(proposal.id)}
                onReject={() => onReject(proposal.id)}
                onEdit={() => onEdit(proposal)}
                onDelete={() => onDelete(proposal)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ProposalsTab;


