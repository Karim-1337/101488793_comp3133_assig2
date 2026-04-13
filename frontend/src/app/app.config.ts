import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const http = httpLink.create({
        uri: `${environment.apiUrl}/graphql`,
      });
      const auth = setContext((_, prev) => {
        const token = localStorage.getItem('comp3133_assignment2_token');
        const base =
          prev.headers instanceof HttpHeaders
            ? prev.headers
            : new HttpHeaders(
                (prev.headers as unknown as Record<string, string>) ?? undefined
              );
        const headers = token ? base.set('authorization', `Bearer ${token}`) : base;
        return { headers };
      });
      return {
        link: ApolloLink.from([auth, http]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
