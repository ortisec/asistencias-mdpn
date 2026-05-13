export function Input({ label, id, ...props }) {
  return (
    <div className="flex flex-col space-y-1">
      {/* Si pasamos un label, lo renderiza */}
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white transition-colors"
        {...props}
      />
    </div>
  );
}