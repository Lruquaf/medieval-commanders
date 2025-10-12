import React from 'react';
import { formatYearRange } from '../utils/years';
// Compact, read-only row for public proposals

const ProposalPublicRow = ({ proposal }) => {
  const yearsInline = formatYearRange(proposal.birthYear ?? null, proposal.deathYear ?? null);

  const proposerInfo = (() => {
    const name = proposal.proposerName && String(proposal.proposerName).trim();
    const ig = proposal.proposerInstagram && String(proposal.proposerInstagram).trim();
    if (name || ig) {
      return (
        <>
          {name || ''} {ig ? (
            <a
              href={`https://instagram.com/${ig.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="proposal-public-ig"
            >
              @{ig.replace(/^@/, '')}
            </a>
          ) : null}
        </>
      );
    }
    if (proposal.email) return <>{proposal.email}</>;
    return <>N/A</>;
  })();

  return (
    <div className="proposal-public-row" role="listitem">
      <div className="proposal-public-name">{proposal.name}</div>
      <div className="proposal-public-years">{yearsInline}</div>
      <div className="proposal-public-proposer">{proposerInfo}</div>
    </div>
  );
};

export default ProposalPublicRow;


