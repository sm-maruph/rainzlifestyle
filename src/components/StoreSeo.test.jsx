import { render } from "@testing-library/react";
import StoreSeo from "./StoreSeo";

let mockPathname = "/men";
// CRA's Jest resolver predates React Router 7's package exports. This unit test
// supplies only the location hook; the production build checks the real import.
jest.mock("react-router-dom", () => ({ useLocation: () => ({ pathname: mockPathname }) }), { virtual: true });

test("canonical and robots metadata follow navigation without duplicate tags", () => {
  document.head.innerHTML = '<link rel="canonical" href="https://www.rainzlifestyle.com/" />';
  const view = render(<StoreSeo />);
  expect(document.querySelector('link[rel="canonical"]').href).toBe("https://www.rainzlifestyle.com/men");
  expect(document.title).toBe("Men's Clothing | Rainz Lifestyle");
  mockPathname = "/women";
  view.rerender(<StoreSeo />);
  expect(document.querySelector('meta[name="robots"]').content).toBe("noindex, follow");
  mockPathname = "/privacy-policy/";
  view.rerender(<StoreSeo />);
  expect(document.querySelector('meta[name="robots"]').content).toContain("index, follow");
  expect(document.querySelector('link[rel="canonical"]').href).toBe("https://www.rainzlifestyle.com/privacy-policy");
  expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  expect(document.querySelector('meta[property="og:url"]').content).toBe("https://www.rainzlifestyle.com/privacy-policy");
  mockPathname = "/checkout";
  view.rerender(<StoreSeo />);
  expect(document.querySelector('meta[name="robots"]').content).toBe("noindex, follow");
});
