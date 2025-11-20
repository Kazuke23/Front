import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ProveedorService } from '../../../services/proveedor.service';
import { AuthService } from '../../../services/auth.service';

import { ProveedorListComponent } from './proveedor-list';

describe('ProveedorListComponent', () => {
  let component: ProveedorListComponent;
  let fixture: ComponentFixture<ProveedorListComponent>;
  let mockProveedorService: jasmine.SpyObj<ProveedorService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    mockProveedorService = jasmine.createSpyObj('ProveedorService', ['getProveedores', 'proveedores$']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole', 'authState$']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'events']);
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockProveedorService.proveedores$ = jasmine.createSpyObj('Observable', ['subscribe']);
    mockAuthService.authState$ = jasmine.createSpyObj('Observable', ['subscribe']);
    mockProveedorService.getProveedores.and.returnValue([]);
    mockAuthService.hasRole.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ProveedorListComponent],
      providers: [
        { provide: ProveedorService, useValue: mockProveedorService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


