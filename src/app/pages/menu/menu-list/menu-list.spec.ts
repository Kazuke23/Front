import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MenuService } from '../../../services/menu.service';
import { AuthService } from '../../../services/auth.service';

import { MenuListComponent } from './menu-list';

describe('MenuListComponent', () => {
  let component: MenuListComponent;
  let fixture: ComponentFixture<MenuListComponent>;
  let mockMenuService: jasmine.SpyObj<MenuService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    mockMenuService = jasmine.createSpyObj('MenuService', ['getMenus', 'menus$']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole', 'authState$']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'events']);
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockMenuService.menus$ = jasmine.createSpyObj('Observable', ['subscribe']);
    mockAuthService.authState$ = jasmine.createSpyObj('Observable', ['subscribe']);
    mockMenuService.getMenus.and.returnValue([]);
    mockAuthService.hasRole.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [MenuListComponent],
      providers: [
        { provide: MenuService, useValue: mockMenuService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
