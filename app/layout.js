import { GoogleAnalytics } from "@next/third-parties/google";

import { ThemeProvider } from "@/components/theme-provider";
import IFSCForm from "./(components)/IFSCForm";

import "./globals.css";

export const viewport = {
  themeColor: "#ffffff"
};

export default function RootLayout({ children, pageProps }) {
  return (
    <html lang="en">
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* <IFSCForm /> */}
          {children}
        </ThemeProvider>
      </body>
      {process.env.NODE_ENV !== "development" && <GoogleAnalytics gaId="" />}
    </html>
  );
}

export const metadata = () => {
  const name = "IFSC Code";
  const title = "IFSC Code Title";
  const description = "IFSC Code Description";
  const url = process.env.NEXT_PUBLIC_BASE_URL;
  const ogImage = `${process.env.NEXT_PUBLIC_BASE_URL}/og.jpg`;

  return {
    title: {
      default: title,
      template: `%s | ${title}`
    },
    description: description,
    keywords: ["IFSC Code"],
    icons: [{ rel: "icon", url: "favicon.ico" }],
    metadataBase: new URL(url),
    alternates: {
      canonical: "/"
    },
    robots: {
      index: true,
      follow: true
    },
    verification: {
      google: "",
      yandex: "",
      other: {
        "msvalidate.01": [""]
      }
    },
    openGraph: {
      type: "website",
      locale: "en",
      url: url,
      title: title,
      description: description,
      siteName: name,
      images: [
        {
          url: "favicon.svg"
          // width: 800,
          // height: 600
        }
      ]
    }
  };
};
