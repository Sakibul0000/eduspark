import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface CourseThumbnailProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export const CourseThumbnail: React.FC<CourseThumbnailProps> = ({
  src,
  alt,
  title,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600/15 via-violet-600/10 to-blue-600/15 dark:from-indigo-500/20 dark:via-violet-500/15 dark:to-slate-900 text-indigo-700 dark:text-indigo-300 p-6 text-center ${className}`}
      >
        <BookOpen className="w-8 h-8 mb-2 opacity-80" />
        <span className="text-xs font-medium line-clamp-2 max-w-[180px]">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover w-full h-full ${className}`}
    />
  );
};
