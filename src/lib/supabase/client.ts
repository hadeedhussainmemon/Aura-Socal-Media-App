export const createClient = () => {
    const stub = {
        channel: () => stub,
        on: () => stub,
        subscribe: () => stub,
        unsubscribe: () => stub,
        removeChannel: () => stub,
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
    };
    return stub as any;
};
