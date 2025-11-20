import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { ProveedorService } from '../../../services/proveedor.service';

import { ProveedorCreateComponent } from './proveedor-create';

describe('ProveedorCreateComponent', () => {
  let component: ProveedorCreateComponent;
  let fixture: ComponentFixture<ProveedorCreateComponent>;
  let mockProveedorService: jasmine.SpyObj<ProveedorService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockProveedorService = jasmine.createSpyObj('ProveedorService', ['getProveedorById', 'addProveedor', 'updateProveedor']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [ProveedorCreateComponent],
      providers: [
        { provide: ProveedorService, useValue: mockProveedorService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedorCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


