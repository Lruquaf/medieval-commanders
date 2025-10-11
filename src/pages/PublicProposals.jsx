import React, { useEffect, useMemo } from 'react';
import { usePublicProposals } from '../hooks/usePublicProposals';
import ProposalPublicRow from '../components/ProposalPublicRow';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ProposalFormModal from '../components/ProposalFormModal';

const PublicProposals = () => {
  const { proposals, loading, error, fetchProposals, refetch } = usePublicProposals();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const sortedProposals = useMemo(() => {
    return [...proposals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [proposals]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem 1rem', color: '#e6d7c3' }}>
        Failed to load proposals.
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Public Proposals</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Propose Card</button>
      </div>
      {sortedProposals.length === 0 ? (
        <EmptyState
          title="No proposals yet"
          description="Be the first to propose a new commander!"
        />
      ) : (
        <div role="list" className="proposal-public-list">
          {sortedProposals.map((proposal) => (
            <ProposalPublicRow key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
      <ProposalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default PublicProposals;


