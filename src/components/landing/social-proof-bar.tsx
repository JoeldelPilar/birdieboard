const stats = [
  { number: '500+', label: 'Active Golfers' },
  { number: '10,000+', label: 'Rounds Tracked' },
  { number: '200+', label: 'Courses Played' },
] as const;

export function SocialProofBar() {
  return (
    <section
      className="bg-gray-50 py-12 px-6 border-y border-gray-100"
      aria-label="Platform statistics"
    >
      <div className="max-w-4xl mx-auto">
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="mt-1 text-sm text-gray-500 font-medium">{stat.label}</dt>
              <dd className="text-3xl md:text-4xl font-bold text-golf-green">{stat.number}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
