// Card.jsx
export function Card({ children, className = "", onClick, ...props }) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm p-6 ${className} cursor-pointer`}
      onClick={onClick} // <-- this is what makes it clickable
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3
      className={`text-lg font-semibold text-gray-800 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`text-gray-600 ${className}`} {...props}>
      {children}
    </div>
  );
}
