import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('pages/SiteLayout.tsx', [
    index('pages/Home.tsx'),
    route('about', 'pages/About.tsx'),
    route('projects', 'pages/Projects.tsx'),
    route('workshop', 'pages/Workshop.tsx'),
    route('faq', 'pages/Faq.tsx'),
    route('pricing', 'pages/Pricing.tsx'),
    route('privacy-policy', 'pages/PrivacyPolicy.tsx'),
    route('terms-of-service', 'pages/TermsOfService.tsx'),
    route('contact', 'pages/ContactRedirect.tsx'),
  ]),
  // Prerendered to 404.html; the splat below is skipped by prerender.
  route('404', 'pages/NotFound.tsx', { id: 'not-found-page' }),
  route('*', 'pages/NotFound.tsx'),
] satisfies RouteConfig;
