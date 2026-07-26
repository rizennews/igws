import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[24px] shadow-sm max-w-md w-full text-center border border-[#E4E8F6]">
        <div className="w-16 h-16 bg-purple/10 text-purple rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-navy mb-3 font-serif">Form Not Found</h1>
        <p className="text-muted text-[13px] leading-relaxed mb-4">
          We couldn't find the form you're looking for. It might have been moved, deleted, or the link may contain a typo.
        </p>
        <p className="text-muted text-[13px] leading-relaxed italic">
          Please contact the person who shared this link with you to get the correct URL.
        </p>
      </div>
    </div>
  );
}
