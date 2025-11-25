import { SessionContext, type SessionContextValue } from "next-auth/react";
import { useMemo } from "react";
import type React from "react";

type MockAuthStateItem = {
  title: string;
  session:
    | {
        data: {
          user: {
            id: string;
            name: string;
            email: string;
            image: string;
          };
        } | null;
        status: "unauthenticated" | "loading" | "authenticated";
      }
    | undefined;
};

export const MockAuthState: Record<string, MockAuthStateItem> = {
  unauthenticated: {
    title: "unauthenticated",
    session: {
      data: null,
      status: "unauthenticated",
    },
  },
  loading: {
    title: "loading",
    session: {
      data: null,
      status: "loading",
    },
  },
  authenticated: {
    title: "authenticated",
    session: {
      data: {
        user: {
          id: "1",
          name: "test name",
          email: "example@example.com",
          image: "/iStock-1411151769.jpg",
        },
      },
      status: "authenticated",
    },
  },
  authenticatedAdmin: {
    title: "authenticatedAdmin",
    session: {
      data: {
        user: {
          id: "2",
          name: "test admin name",
          email: "hoge@omoshiro-technology.co.jp",
          image: "/iStock-1411151769.jpg",
        },
      },
      status: "authenticated",
    },
  },
};

export const MockAuthGlobalTypes = {
  authentication: {
    name: "Authentication",
    description: "Global authentication state",
    defaultValue: null,
    toolbar: {
      icon: "user",
      items: Object.keys(MockAuthState).map((e) => ({
        value: e,
        title: MockAuthState[e].title,
      })),
    },
  },
};

export const withMockAuth = (
  Story: React.ComponentType,
  context: {
    globals: Record<string, unknown>;
    parameters?: Record<string, unknown>;
  }
) => {
  const { authentication } = context.globals;

  const session = (() => {
    const parameter = context?.parameters?.nextAuthMock;
    if (typeof parameter === "undefined") {
      MockAuthState.unauthenticated.session;
    } else if (typeof parameter?.session === "string") {
      return MockAuthState[parameter.session].session;
    } else {
      return parameter?.session
        ? parameter.session
        : MockAuthState[authentication].session;
    }
  })();

  return (
    <MockSessionContext session={session}>
      <Story {...context} />
    </MockSessionContext>
  );
};

const MockSessionContext = ({
  session,
  children,
}: {
  session?: {
    data: Record<string, unknown>;
    status: string;
  };
  children: React.ReactNode;
}) => {
  const value = useMemo(() => {
    return session ? session : MockAuthState.unauthenticated.session;
  }, [session]) as SessionContextValue;

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

MockSessionContext.displayName = "MockSessionContext";
