import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHandlerFn,
} from '@angular/common/http';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { Observable, throwError, of } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../../shared/services/toast.service';

describe('ErrorInterceptor', () => {
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const toastSpy = jasmine.createSpyObj('ToastService', ['showError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: ToastService, useValue: toastSpy }],
    });

    toastServiceMock = TestBed.inject(
      ToastService
    ) as jasmine.SpyObj<ToastService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should catch error and show toast', (done) => {
    const mockErrorResponse = {
      status: 400,
      statusText: 'Bad Request',
      error: { message: 'Bad request error' },
    };

    const mockRequest = new HttpRequest('GET', '/api/test');
    const mockHandler: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse(mockErrorResponse));

    const actualInterceptor = TestBed.runInInjectionContext(() => {
      return errorInterceptor(mockRequest, mockHandler);
    });

    actualInterceptor.subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(error.message).toBeDefined();
        expect(toastServiceMock.showError).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should handle client-side error', (done) => {
    const clientError = new ErrorEvent('ClientError', {
      message: 'Client side error occurred',
    });

    const mockRequest = new HttpRequest('GET', '/api/test');
    const mockHandler: HttpHandlerFn = () =>
      throwError(
        () =>
          new HttpErrorResponse({
            error: clientError,
          })
      );

    const actualInterceptor = TestBed.runInInjectionContext(() => {
      return errorInterceptor(mockRequest, mockHandler);
    });

    actualInterceptor.subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(error.message).toContain('Client side error occurred');
        expect(toastServiceMock.showError).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should handle network error', (done) => {
    const mockRequest = new HttpRequest('GET', '/api/test');
    const mockHandler: HttpHandlerFn = () =>
      throwError(
        () =>
          new HttpErrorResponse({
            status: 0,
          })
      );

    const actualInterceptor = TestBed.runInInjectionContext(() => {
      return errorInterceptor(mockRequest, mockHandler);
    });

    actualInterceptor.subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(error.message).toContain('No connection to the server');
        expect(toastServiceMock.showError).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should pass through successful responses', (done) => {
    const mockRequest = new HttpRequest('GET', '/api/test');
    const mockResponse = { data: 'test' } as unknown as HttpEvent<any>;
    const mockHandler: HttpHandlerFn = () => of(mockResponse);

    const actualInterceptor = TestBed.runInInjectionContext(() => {
      return errorInterceptor(mockRequest, mockHandler);
    });

    actualInterceptor.subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(toastServiceMock.showError).not.toHaveBeenCalled();
      done();
    });
  });
});
