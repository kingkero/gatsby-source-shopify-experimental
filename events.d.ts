interface Event {
    subject_id: number;
    subject_type: string;
}
export declare function eventsApi(options: ShopifyPluginOptions): {
    fetchDestroyEventsSince(date: Date): Promise<Event[]>;
};
export {};
