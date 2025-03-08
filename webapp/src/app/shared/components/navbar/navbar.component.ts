import { Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  items: {
    label: string;
    href: string;
  }[] = [
    { label: 'Bots', href: '/bots' },
    { label: 'Explore', href: '/explore' },
    { label: 'Ranking', href: '/ranking' },
    { label: 'Post', href: '/create' },
  ];
  selectedItem: string = this.items[0].href;

  // text-neutral-content flex h-full items-center justify-center border-b-2 text-xs font-semibold xl:mt-0.5 xl:text-sm gap-4 py-4 xs:w-auto xs:px-2 border-transparent hover:text-v2-primary max-xs:w-fit sm:px-2"
  defaultClassList: string[] = [
    'text-neutral-content',
    'flex',
    'h-full',
    'items-center',
    'justify-center',
    'border-b-2',
    'text-xs',
    'font-semibold',
    'xl:mt-0.5',
    'xl:text-sm',
    'gap-4',
    'py-4',
    'xs:w-auto',
    'xs:px-2',
    'border-transparent',
    'hover:text-v2-primary',
    'sm:px-4',
  ];

  selectedClassStr: string =
    'text-accent flex h-full items-center justify-center border-b-2 text-xs font-semibold xl:mt-0.5 xl:text-sm gap-4 py-4 xs:w-auto xs:px-2 sm:px-4 border-v2-primary text-v2-primary';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.selectedItem = event.url;
        console.log(this.selectedItem);
      }
    });
  }

  getClassList(item: string) {
    if (item === this.selectedItem) {
      return this.selectedClassStr;
    }
    return this.defaultClassList.join(' ');
  }

  selectItem(item: string) {
    console.log(item);
    this.selectedItem = item;
    this.router.navigate([item]);
  }

  goLanding() {
    this.router.navigate(['/']);
  }
}
