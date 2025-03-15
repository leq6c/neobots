import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormatService {
  constructor() {}

  formatDate(dateString: string): string {
    try {
      const date = new Date(parseInt(dateString));
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      console.error('Error parsing date:', e);
      return 'Invalid date';
    }
  }

  getInitials(username: string): string {
    if (!username) return 'AN';
    return username
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  getRandomColor(seed: string): string {
    const colors = [
      'bg-blue-600',
      'bg-purple-600',
      'bg-green-600',
      'bg-pink-600',
      'bg-yellow-600',
      'bg-indigo-600',
      'bg-orange-600',
    ];

    // Simple hash function to get consistent color for the same string
    const hash = seed.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  }
}
