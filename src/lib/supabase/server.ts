export const createServerClient = () => {
    const stub = {
        from: () => stub,
        select: () => stub,
        eq: () => stub,
        order: () => stub,
        limit: () => stub,
        insert: () => stub,
        update: () => stub,
        delete: () => stub,
        in: () => stub,
        then: (cb: any) => cb({ data: [], error: null }),
        single: () => stub,
        auth: {
            getUser: async () => ({ data: { user: null }, error: null }),
        }
    };
    return stub as any;
};
export const createClient = createServerClient;
