// Type definitions for disconnect 1.2.2
// Project: https://github.com/bartve/disconnect
// Definitions by: Gemini
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node" />

import { IncomingMessage } from "http";
import { ParsedUrlQuery } from "querystring";

declare module "disconnect" {
    export { DiscogsClient as Client, util };

    namespace util {
        /**
         * Strip the trailing number from a Discogs artist name Artist (2) -> Artist
         */
        function stripVariation(name: string): string;

        /**
         * Add params to a given url or path
         */
        function addParams(url: string, data?: Record<string, any>): string;

        /**
         * Escape a string for use in a query string
         */
        function escape(str: string): string;

        /**
         * Deep merge two objects
         */
        function merge<T extends object, U extends object>(
            target: T,
            source: U,
        ): T & U;
        function merge(target: any, source: any): any; // Allow any for flexibility if precise typing is hard

        class Queue {
            constructor(customConfig?: Partial<QueueConfig>);
            setConfig(customConfig: Partial<QueueConfig>): this;
            add(
                callback: (
                    err: DiscogsError | null,
                    freeCallsRemaining?: number,
                    freeStackPositionsRemaining?: number,
                ) => void,
            ): this;
            clear(): this;
        }
    }

    interface DiscogsAuthMethodDiscogs {
        method: "discogs";
        userToken?: string;
        consumerKey?: string;
        consumerSecret?: string;
        level?: 0 | 1 | 2; // 0: none, 1: key/secret, 2: token or full OAuth
    }

    interface DiscogsAuthMethodOAuth {
        method: "oauth";
        consumerKey: string;
        consumerSecret: string;
        token?: string; // Access token or request token
        tokenSecret?: string; // Access token secret or request token secret
        authorizeUrl?: string; // URL to redirect user for authorization (after getting request token)
        level?: 0 | 1 | 2; // Typically 2 after full OAuth flow
    }

    type DiscogsAuth = DiscogsAuthMethodDiscogs | DiscogsAuthMethodOAuth;

    interface DiscogsClientConfig {
        host: string;
        port: number;
        userAgent: string;
        apiVersion: string;
        outputFormat: "discogs" | "plaintext" | "html";
        requestLimit: number;
        requestLimitAuth: number;
        requestLimitInterval: number; // in milliseconds
    }

    interface QueueConfig {
        maxStack: number;
        maxCalls: number;
        interval: number; // in milliseconds
    }

    interface RateLimitInfo {
        limit: number;
        used: number;
        remaining: number;
    }

    type DiscogsCallback<TData = any> = (
        err: DiscogsError | AuthError | null,
        data?: TData,
        rateLimit?: RateLimitInfo | null,
    ) => void;

    interface RequestOptions {
        url: string;
        method?: "GET" | "POST" | "PUT" | "DELETE";
        data?: any; // For POST/PUT data
        authLevel?: 0 | 1 | 2; // Required authentication level
        encoding?: BufferEncoding;
        queue?: boolean; // Whether to use the request queue (default: true)
        json?: boolean; // Whether to parse response as JSON (default: true)
    }

    interface PaginationParams {
        page?: number;
        per_page?: number;
    }

    interface SortParams {
        sort?: string;
        sort_order?: "asc" | "desc";
    }

    // Base for API responses that include pagination
    interface PaginatedResponse<TItem> {
        pagination: {
            page: number;
            pages: number;
            per_page: number;
            items: number;
            urls: {
                last?: string;
                next?: string;
            };
        };
        results: TItem[]; // Discogs API often uses 'results' for lists
        // Sometimes other top-level keys exist, e.g. 'releases' for collection items
    }

    class DiscogsError extends Error {
        statusCode: number;
        constructor(statusCode?: number, message?: string);
        toString(): string;
    }

    class AuthError extends DiscogsError {
        constructor();
    }

    class DiscogsClient {
        constructor(userAgent?: string | DiscogsAuth, auth?: DiscogsAuth);

        config: DiscogsClientConfig;
        auth?: DiscogsAuth;

        setConfig(customConfig: Partial<DiscogsClientConfig>): this;
        authenticated(level?: 0 | 1 | 2): boolean;

        getIdentity(callback: DiscogsCallback<Identity>): this;
        getIdentity(): Promise<Identity>;

        about(callback: DiscogsCallback<AboutInfo>): void;
        about(): Promise<AboutInfo>;

        get<TData = any>(
            options: string | RequestOptions,
            callback: DiscogsCallback<TData>,
        ): this;
        get<TData = any>(options: string | RequestOptions): Promise<TData>;

        post<TData = any>(
            options: string | RequestOptions,
            data: any,
            callback: DiscogsCallback<TData>,
        ): this;
        post<TData = any>(
            options: string | RequestOptions,
            data: any,
        ): Promise<TData>;

        put<TData = any>(
            options: string | RequestOptions,
            data: any,
            callback: DiscogsCallback<TData>,
        ): this;
        put<TData = any>(
            options: string | RequestOptions,
            data: any,
        ): Promise<TData>;

        delete<TData = any>(
            options: string | RequestOptions,
            callback: DiscogsCallback<TData>,
        ): this;
        delete<TData = any>(options: string | RequestOptions): Promise<TData>;

        oauth(): DiscogsOAuth;
        database(): Database;
        marketplace(): Marketplace;
        user(): User;
    }

    interface DiscogsOAuthConstructorAuth {
        method: "oauth";
        consumerKey?: string;
        consumerSecret?: string;
        token?: string;
        tokenSecret?: string;
        authorizeUrl?: string;
        level?: 0 | 1 | 2;
    }

    interface DiscogsOAuth {
        constructor(auth?: DiscogsOAuthConstructorAuth): void;
        config: {
            requestTokenUrl: string;
            accessTokenUrl: string;
            authorizeUrl: string;
            version: string;
            signatureMethod: "PLAINTEXT" | "HMAC-SHA1";
        };
        auth: DiscogsOAuthConstructorAuth;

        setConfig(customConfig: Partial<DiscogsOAuth["config"]>): this;

        getRequestToken(
            consumerKey: string,
            consumerSecret: string,
            callbackUrl: string,
            callback?: (
                err: Error | null,
                authData: DiscogsOAuthConstructorAuth & {
                    authorizeUrl: string;
                },
            ) => void,
        ): this;

        getAccessToken(
            verifier: string,
            callback?: (
                err: Error | null,
                authData: DiscogsOAuthConstructorAuth,
            ) => void,
        ): this;

        export(): DiscogsOAuthConstructorAuth;
        toHeader(requestMethod: string, url: string): string;
    }

    // Data interfaces (examples, can be expanded)
    interface Identity {
        id: number;
        username: string;
        resource_url: string;
        consumer_name: string;
    }

    interface AboutInfo {
        disconnect: {
            version: string;
            userAgent: string;
            authMethod: string;
            authLevel: number;
        };
        // ... other properties from Discogs API root
        api_version: string;
        documentation_url: string;
        hello: string;
    }

    interface Artist {
        id: number;
        name: string;
        realname?: string;
        resource_url: string;
        uri: string;
        releases_url: string;
        images?: Image[];
        profile?: string;
        urls?: string[];
        namevariations?: string[];
        aliases?: Alias[];
        members?: Member[];
        groups?: Group[];
        data_quality?: string;
        // ... and more
    }

    interface Release {
        id: number;
        title: string;
        resource_url: string;
        uri: string;
        status?: string;
        data_quality?: string;
        master_id?: number;
        master_url?: string;
        year?: number;
        released?: string; // YYYY-MM-DD or YYYY or YYYY-MM
        released_formatted?: string;
        country?: string;
        notes?: string;
        styles?: string[];
        genres?: string[];
        images?: Image[];
        artists?: ArtistStub[];
        extraartists?: ArtistStub[]; // And other roles
        labels?: LabelStub[];
        companies?: CompanyStub[];
        formats?: Format[];
        tracklist?: Track[];
        videos?: Video[];
        identifiers?: Identifier[];
        community?: CommunityReleaseInfo;
        // ... and more
    }

    interface ArtistStub {
        id: number;
        name: string;
        resource_url: string;
        anv?: string; // Artist Name Variation
        join?: string;
        role?: string;
        tracks?: string; // e.g. "A1, A2"
    }

    interface LabelStub {
        id: number;
        name: string;
        resource_url: string;
        catno?: string; // Catalog number
        entity_type?: string; // "Label", "Company"
        entity_type_name?: string;
    }

    interface CompanyStub extends LabelStub {}

    interface Format {
        name: string;
        qty: string; // Number of units, e.g., "1" for a single LP
        text?: string; // Free-text description
        descriptions?: string[]; // e.g., ["LP", "Album", "Reissue"]
    }

    interface Track {
        position: string; // e.g., "A1", "1"
        type_: string; // "track", "heading"
        title: string;
        duration?: string; // "MM:SS"
        artists?: ArtistStub[];
        extraartists?: ArtistStub[];
    }

    interface Image {
        type: "primary" | "secondary";
        uri: string;
        resource_url: string;
        uri150: string; // URL for 150x150 thumbnail
        width: number;
        height: number;
    }

    interface Video {
        uri: string;
        title: string;
        description?: string;
        duration?: number; // in seconds
        embed?: boolean;
    }

    interface Identifier {
        type: string; // e.g. "Barcode", "ASIN", "Matrix / Runout"
        value: string;
        description?: string;
    }

    interface CommunityReleaseInfo {
        status?: string; // e.g. "Accepted"
        rating: {
            count: number;
            average: number;
        };
        have: number;
        want: number;
        submitter?: UserStub;
        contributors?: UserStub[];
        data_quality?: string;
    }

    interface UserStub {
        username: string;
        resource_url: string;
    }

    interface Alias {
        id: number;
        name: string;
        resource_url: string;
    }

    interface Member extends ArtistStub {}
    interface Group extends ArtistStub {}

    interface MasterRelease {
        id: number;
        main_release: number;
        main_release_url: string;
        resource_url: string;
        uri: string;
        versions_url: string;
        title: string;
        year: number;
        artists: ArtistStub[];
        genres: string[];
        styles?: string[];
        images?: Image[];
        tracklist: Track[];
        data_quality: string;
        videos?: Video[];
        // ... and more
    }

    interface Label {
        id: number;
        name: string;
        profile?: string;
        releases_url: string;
        resource_url: string;
        uri: string;
        urls?: string[];
        images?: Image[];
        sublabels?: LabelStub[];
        parent_label?: LabelStub;
        data_quality?: string;
        contact_info?: string;
        // ... and more
    }

    interface ReleaseRating {
        username: string;
        release_id: number;
        rating: number; // 1-5
    }

    interface DatabaseSearchItemBase {
        id: number;
        resource_url: string;
        uri: string;
        type: "release" | "master" | "artist" | "label";
        title: string; // For releases/masters, often "Artist - Title"
        thumb: string; // URL to thumbnail image
        cover_image: string; // URL to cover image
        user_data?: { // If authenticated
            in_wantlist?: boolean;
            in_collection?: boolean;
        };
    }
    interface DatabaseSearchReleaseItem extends DatabaseSearchItemBase {
        type: "release";
        catno?: string;
        year?: string;
        genre?: string[];
        style?: string[];
        country?: string;
        format?: string[]; // e.g. ["Vinyl", "LP", "Album"]
        label?: string[]; // Names of labels
        barcode?: string[];
        community?: {
            want?: number;
            have?: number;
        };
    }
    interface DatabaseSearchMasterItem extends DatabaseSearchItemBase {
        type: "master";
        catno?: string;
        year?: string;
        genre?: string[];
        style?: string[];
        country?: string;
        format?: string[];
        label?: string[];
        barcode?: string[];
        community?: {
            want?: number;
            have?: number;
        };
    }
    interface DatabaseSearchArtistItem extends DatabaseSearchItemBase {
        type: "artist";
        // Artist specific search result fields if any
    }
    interface DatabaseSearchLabelItem extends DatabaseSearchItemBase {
        type: "label";
        catno?: string; // Sometimes present
        // Label specific search result fields if any
    }

    type DatabaseSearchItem =
        | DatabaseSearchReleaseItem
        | DatabaseSearchMasterItem
        | DatabaseSearchArtistItem
        | DatabaseSearchLabelItem;
    type DatabaseSearchResponse = PaginatedResponse<DatabaseSearchItem>;

    interface Database {
        status: {
            accepted: "Accepted";
            draft: "Draft";
            deleted: "Deleted";
            rejected: "Rejected";
        };

        getArtist(
            artistId: number | string,
            callback: DiscogsCallback<Artist>,
        ): DiscogsClient;
        getArtist(artistId: number | string): Promise<Artist>;

        getArtistReleases(
            artistId: number | string,
            params: PaginationParams & SortParams,
            callback: DiscogsCallback<PaginatedResponse<Release>>,
        ): DiscogsClient;
        getArtistReleases(
            artistId: number | string,
            callback: DiscogsCallback<PaginatedResponse<Release>>,
        ): DiscogsClient;
        getArtistReleases(
            artistId: number | string,
            params?: PaginationParams & SortParams,
        ): Promise<PaginatedResponse<Release>>;

        getRelease(
            releaseId: number | string,
            callback: DiscogsCallback<Release>,
        ): DiscogsClient;
        getRelease(releaseId: number | string): Promise<Release>;

        getReleaseRating(
            releaseId: number | string,
            username: string,
            callback: DiscogsCallback<ReleaseRating>,
        ): DiscogsClient;
        getReleaseRating(
            releaseId: number | string,
            username: string,
        ): Promise<ReleaseRating>;

        setReleaseRating(
            releaseId: number | string,
            username: string,
            rating: number | null,
            callback: DiscogsCallback<ReleaseRating | "">,
        ): DiscogsClient; // Empty string on delete
        setReleaseRating(
            releaseId: number | string,
            username: string,
            rating: number | null,
        ): Promise<ReleaseRating | "">;

        getMaster(
            masterId: number | string,
            callback: DiscogsCallback<MasterRelease>,
        ): DiscogsClient;
        getMaster(masterId: number | string): Promise<MasterRelease>;

        getMasterVersions(
            masterId: number | string,
            params: PaginationParams,
            callback: DiscogsCallback<PaginatedResponse<Release>>,
        ): DiscogsClient; // Versions are like releases
        getMasterVersions(
            masterId: number | string,
            callback: DiscogsCallback<PaginatedResponse<Release>>,
        ): DiscogsClient;
        getMasterVersions(
            masterId: number | string,
            params?: PaginationParams,
        ): Promise<PaginatedResponse<Release>>;

        getLabel(
            labelId: number | string,
            callback: DiscogsCallback<Label>,
        ): DiscogsClient;
        getLabel(labelId: number | string): Promise<Label>;

        getLabelReleases(
            labelId: number | string,
            params: PaginationParams & SortParams,
            callback: DiscogsCallback<PaginatedResponse<Release>>,
        ): DiscogsClient;
        getLabelReleases(
            labelId: number | string,
            callback: DiscogsCallback<PaginatedResponse<Release>>,
        ): DiscogsClient;
        getLabelReleases(
            labelId: number | string,
            params?: PaginationParams & SortParams,
        ): Promise<PaginatedResponse<Release>>;

        getImage(
            imageUrl: string,
            callback: DiscogsCallback<Buffer>,
        ): DiscogsClient; // Returns binary image data
        getImage(imageUrl: string): Promise<Buffer>;

        search(
            query: string,
            params: DatabaseSearchParams,
            callback: DiscogsCallback<DatabaseSearchResponse>,
        ): DiscogsClient;
        search(
            params: DatabaseSearchParams & { q?: string },
            callback: DiscogsCallback<DatabaseSearchResponse>,
        ): DiscogsClient;
        search(
            query: string,
            callback: DiscogsCallback<DatabaseSearchResponse>,
        ): DiscogsClient;
        search(
            query: string | (DatabaseSearchParams & { q?: string }),
            params?: DatabaseSearchParams,
        ): Promise<DatabaseSearchResponse>;
    }

    interface DatabaseSearchParams extends PaginationParams {
        q?: string; // query
        type?: "release" | "master" | "artist" | "label";
        title?: string;
        release_title?: string;
        credit?: string;
        artist?: string;
        anv?: string; // artist name variation
        label?: string;
        genre?: string;
        style?: string;
        country?: string;
        year?: string;
        format?: string;
        catno?: string; // catalog number
        barcode?: string;
        track?: string; // track title
        submitter?: string; // username
        contributor?: string; // username
    }

    interface MarketplaceListing {
        id: number;
        resource_url: string;
        uri: string;
        status: string; // e.g. "For Sale"
        price: {
            value: number;
            currency: string;
        };
        allow_offers: boolean;
        sleeve_condition: string; // e.g. "Mint (M)"
        condition: string; // Media condition
        posted: string; // ISO 8601 datetime
        ships_from: string;
        comments?: string;
        seller: UserStub;
        release: {
            id: number;
            resource_url: string;
            description: string; // Typically "Artist - Title"
            thumbnail: string;
            // ... and more release details
            format: string;
            catno: string;
            year: number;
        };
        // ... and more
    }

    interface CreateListingData {
        release_id: number;
        condition: string; // e.g. "Mint (M)"
        sleeve_condition?: string;
        price: number;
        status: "For Sale" | "Draft"; // Usually 'For Sale'
        comments?: string;
        allow_offers?: boolean;
        external_id?: string;
        location?: string;
        weight?: number; // in grams
        format_quantity?: number; // Number of items in the release, e.g. 2 for a 2xLP
    }

    interface EditListingData extends Partial<CreateListingData> {}

    interface MarketplaceOrder {
        id: string; // Order ID can be non-numeric, e.g., "1-12345"
        resource_url: string;
        status: string; // e.g. "New Order", "Payment Received", "Shipped"
        buyer: UserStub;
        created: string; // ISO 8601 datetime
        last_activity: string; // ISO 8601 datetime
        total: {
            value: number;
            currency: string;
        };
        shipping: {
            value: number;
            currency: string;
        };
        items: Array<{
            id: number; // Listing ID
            price: {
                value: number;
                currency: string;
            };
            release: {
                id: number;
                description: string; // "Artist - Title"
                thumbnail: string;
            };
            // ... and more
        }>;
        // ... and more
    }

    interface EditOrderData {
        status?: string; // e.g. "Payment Received", "Shipped"
        shipping?: number; // New shipping price
    }

    interface OrderMessage {
        message: string;
        order_id: string;
        subject: string;
        timestamp: string; // ISO 8601 datetime
        from: UserStub;
        // ... and more
    }

    interface AddOrderMessageData {
        message?: string;
        status?: string; // Can update order status while sending message
    }

    interface Fee {
        value: number;
        currency: string;
    }

    interface PriceSuggestion {
        // e.g. "Mint (M)": { value: number, currency: string }
        [condition: string]: {
            value: number;
            currency: string;
        };
    }

    interface InventoryItem extends MarketplaceListing {
        // Inventory might have slightly different or more fields
    }
    type InventoryResponse = PaginatedResponse<InventoryItem>;

    interface Marketplace {
        getInventory(
            username: string,
            params: InventoryParams,
            callback: DiscogsCallback<InventoryResponse>,
        ): DiscogsClient;
        getInventory(
            username: string,
            callback: DiscogsCallback<InventoryResponse>,
        ): DiscogsClient;
        getInventory(
            username: string,
            params?: InventoryParams,
        ): Promise<InventoryResponse>;

        getListing(
            listingId: number | string,
            callback: DiscogsCallback<MarketplaceListing>,
        ): DiscogsClient;
        getListing(listingId: number | string): Promise<MarketplaceListing>;

        addListing(
            data: CreateListingData,
            callback: DiscogsCallback<MarketplaceListing>,
        ): DiscogsClient; // Response might be slightly different, check API
        addListing(data: CreateListingData): Promise<MarketplaceListing>;

        editListing(
            listingId: number | string,
            data: EditListingData,
            callback: DiscogsCallback<MarketplaceListing>,
        ): DiscogsClient;
        editListing(
            listingId: number | string,
            data: EditListingData,
        ): Promise<MarketplaceListing>;

        deleteListing(
            listingId: number | string,
            callback: DiscogsCallback<any>,
        ): DiscogsClient; // Typically 204 No Content
        deleteListing(listingId: number | string): Promise<any>;

        getOrders(
            params: MarketplaceOrdersParams,
            callback: DiscogsCallback<PaginatedResponse<MarketplaceOrder>>,
        ): DiscogsClient;
        getOrders(
            callback: DiscogsCallback<PaginatedResponse<MarketplaceOrder>>,
        ): DiscogsClient;
        getOrders(
            params?: MarketplaceOrdersParams,
        ): Promise<PaginatedResponse<MarketplaceOrder>>;

        getOrder(
            orderId: string,
            callback: DiscogsCallback<MarketplaceOrder>,
        ): DiscogsClient;
        getOrder(orderId: string): Promise<MarketplaceOrder>;

        editOrder(
            orderId: string,
            data: EditOrderData,
            callback: DiscogsCallback<MarketplaceOrder>,
        ): DiscogsClient;
        editOrder(
            orderId: string,
            data: EditOrderData,
        ): Promise<MarketplaceOrder>;

        getOrderMessages(
            orderId: string,
            params: PaginationParams,
            callback: DiscogsCallback<PaginatedResponse<OrderMessage>>,
        ): DiscogsClient;
        getOrderMessages(
            orderId: string,
            callback: DiscogsCallback<PaginatedResponse<OrderMessage>>,
        ): DiscogsClient;
        getOrderMessages(
            orderId: string,
            params?: PaginationParams,
        ): Promise<PaginatedResponse<OrderMessage>>;

        addOrderMessage(
            orderId: string,
            data: AddOrderMessageData,
            callback: DiscogsCallback<OrderMessage>,
        ): DiscogsClient;
        addOrderMessage(
            orderId: string,
            data: AddOrderMessageData,
        ): Promise<OrderMessage>;

        getFee(
            price: number | string,
            currency?: string,
            callback: DiscogsCallback<Fee>,
        ): DiscogsClient;
        getFee(
            price: number | string,
            callback: DiscogsCallback<Fee>,
        ): DiscogsClient;
        getFee(price: number | string, currency?: string): Promise<Fee>;

        getPriceSuggestions(
            releaseId: number | string,
            callback: DiscogsCallback<PriceSuggestion>,
        ): DiscogsClient;
        getPriceSuggestions(
            releaseId: number | string,
        ): Promise<PriceSuggestion>;
    }

    interface InventoryParams extends PaginationParams, SortParams {
        status?:
            | "For Sale"
            | "Draft"
            | "Expired"
            | "Sold"
            | "Violates Policies"
            | string; // Discogs uses specific strings
    }

    interface MarketplaceOrdersParams extends PaginationParams, SortParams {
        status?: string; // e.g. "New Order", "Payment Pending", "Payment Received", "Shipped", "All"
        archived?: boolean;
    }

    interface UserProfile {
        id: number;
        username: string;
        name?: string;
        home_page?: string;
        location?: string;
        profile?: string; // Biography
        registered: string; // ISO 8601 datetime
        rank?: number;
        num_pending: number;
        num_for_sale: number;
        num_lists: number;
        releases_contributed: number;
        releases_rated: number;
        rating_avg: number;
        inventory_url: string;
        collection_folders_url: string;
        collection_fields_url: string;
        wantlist_url: string;
        avatar_url: string;
        curr_abbr: string; // Currency abbreviation e.g. "USD"
        activated: boolean;
        marketplace_suspended: boolean;
        banner_url?: string;
        buyer_rating: number;
        buyer_rating_stars: number; // 0-5
        buyer_num_ratings: number;
        seller_rating: number;
        seller_rating_stars: number; // 0-5
        seller_num_ratings: number;
        // ... and more
    }

    interface UserContribution {
        // Structure depends on the type of contribution (release, artist, label)
        id: number; // Release ID, Artist ID or Label ID
        resource_url: string;
        status: string; // e.g. "Accepted"
        // ... and more, specific to the contribution type
    }
    type UserContributionsResponse = PaginatedResponse<UserContribution>;

    interface UserSubmission {
        // Similar to UserContribution, but for user's own submissions
        id: number;
        resource_url: string;
        title: string; // e.g. "Artist - Release Title"
        // ... and more
    }
    type UserSubmissionsResponse = PaginatedResponse<UserSubmission>;

    interface UserList {
        id: number;
        name: string;
        public: boolean;
        date_added: string; // ISO 8601 datetime
        date_changed: string; // ISO 8601 datetime
        uri: string;
        resource_url: string;
        image_url?: string;
        description?: string;
        user: UserStub;
        // ... and more
    }
    type UserListsResponse = PaginatedResponse<UserList>;

    interface User {
        getProfile(
            username: string,
            callback: DiscogsCallback<UserProfile>,
        ): DiscogsClient;
        getProfile(username: string): Promise<UserProfile>;

        getInventory(
            username: string,
            params: InventoryParams,
            callback: DiscogsCallback<InventoryResponse>,
        ): DiscogsClient;
        getInventory(
            username: string,
            callback: DiscogsCallback<InventoryResponse>,
        ): DiscogsClient;
        getInventory(
            username: string,
            params?: InventoryParams,
        ): Promise<InventoryResponse>;

        getIdentity(callback: DiscogsCallback<Identity>): DiscogsClient;
        getIdentity(): Promise<Identity>;

        collection(): UserCollection;
        wantlist(): UserWantlist;
        list(): UserListAPI;

        getContributions(
            username: string,
            params: PaginationParams & SortParams,
            callback: DiscogsCallback<UserContributionsResponse>,
        ): DiscogsClient;
        getContributions(
            username: string,
            callback: DiscogsCallback<UserContributionsResponse>,
        ): DiscogsClient;
        getContributions(
            username: string,
            params?: PaginationParams & SortParams,
        ): Promise<UserContributionsResponse>;

        getSubmissions(
            username: string,
            params: PaginationParams,
            callback: DiscogsCallback<UserSubmissionsResponse>,
        ): DiscogsClient;
        getSubmissions(
            username: string,
            callback: DiscogsCallback<UserSubmissionsResponse>,
        ): DiscogsClient;
        getSubmissions(
            username: string,
            params?: PaginationParams,
        ): Promise<UserSubmissionsResponse>;

        getLists(
            username: string,
            params: PaginationParams,
            callback: DiscogsCallback<UserListsResponse>,
        ): DiscogsClient;
        getLists(
            username: string,
            callback: DiscogsCallback<UserListsResponse>,
        ): DiscogsClient;
        getLists(
            username: string,
            params?: PaginationParams,
        ): Promise<UserListsResponse>;
    }

    interface CollectionFolder {
        id: number;
        name: string;
        count: number;
        resource_url: string;
    }
    type CollectionFoldersResponse = { folders: CollectionFolder[] };

    interface CollectionRelease {
        id: number; // Release ID
        instance_id: number;
        folder_id: number;
        rating: number; // 0-5
        date_added: string; // ISO 8601 datetime
        basic_information: Release; // Contains basic release info like title, artists, year, formats, cover_image, thumb
        // notes?: CollectionCustomFieldInstance[]; // if custom fields are used
    }
    type CollectionReleasesResponse = PaginatedResponse<CollectionRelease>;

    interface CollectionReleaseInstance { // When getting specific instances of a release
        id: number; // Release ID
        instance_id: number;
        folder_id: number;
        rating: number;
        date_added: string;
        // notes?: CollectionCustomFieldInstance[]; // if custom fields are used
    }
    type CollectionReleaseInstancesResponse = PaginatedResponse<
        CollectionReleaseInstance
    >;

    interface EditReleaseInstanceData {
        rating?: number; // 0-5
        folder_id?: number;
        // For custom fields: field_id (number): value (string)
        [fieldId: string]: any; // To allow custom fields like `field_1: "value"`
    }

    interface UserCollection {
        getFolders(
            username: string,
            callback: DiscogsCallback<CollectionFoldersResponse>,
        ): DiscogsClient;
        getFolders(username: string): Promise<CollectionFoldersResponse>;

        getFolder(
            username: string,
            folderId: number | string,
            callback: DiscogsCallback<CollectionFolder>,
        ): DiscogsClient;
        getFolder(
            username: string,
            folderId: number | string,
        ): Promise<CollectionFolder>;

        addFolder(
            username: string,
            name: string,
            callback: DiscogsCallback<CollectionFolder>,
        ): DiscogsClient;
        addFolder(username: string, name: string): Promise<CollectionFolder>;

        setFolderName(
            username: string,
            folderId: number | string,
            name: string,
            callback: DiscogsCallback<CollectionFolder>,
        ): DiscogsClient;
        setFolderName(
            username: string,
            folderId: number | string,
            name: string,
        ): Promise<CollectionFolder>;

        deleteFolder(
            username: string,
            folderId: number | string,
            callback: DiscogsCallback<any>,
        ): DiscogsClient; // 204 No Content
        deleteFolder(username: string, folderId: number | string): Promise<any>;

        getReleases(
            username: string,
            folderId: number | string,
            params: PaginationParams & SortParams,
            callback: DiscogsCallback<CollectionReleasesResponse>,
        ): DiscogsClient;
        getReleases(
            username: string,
            folderId: number | string,
            callback: DiscogsCallback<CollectionReleasesResponse>,
        ): DiscogsClient;
        getReleases(
            username: string,
            folderId: number | string,
            params?: PaginationParams & SortParams,
        ): Promise<CollectionReleasesResponse>;

        getReleaseInstances(
            username: string,
            releaseId: number | string,
            callback: DiscogsCallback<CollectionReleaseInstancesResponse>,
        ): DiscogsClient;
        getReleaseInstances(
            username: string,
            releaseId: number | string,
        ): Promise<CollectionReleaseInstancesResponse>;

        addRelease(
            username: string,
            folderId: number | string | undefined,
            releaseId: number | string,
            callback: DiscogsCallback<CollectionReleaseInstance>,
        ): DiscogsClient;
        addRelease(
            username: string,
            releaseId: number | string,
            callback: DiscogsCallback<CollectionReleaseInstance>,
        ): DiscogsClient; // folderId defaults to 1 (Uncategorized)
        addRelease(
            username: string,
            folderIdOrReleaseId: number | string,
            releaseIdOrCb?:
                | number
                | string
                | DiscogsCallback<CollectionReleaseInstance>,
            cb?: DiscogsCallback<CollectionReleaseInstance>,
        ): DiscogsClient | Promise<CollectionReleaseInstance>;

        editRelease(
            username: string,
            folderId: number | string,
            releaseId: number | string,
            instanceId: number | string,
            data: EditReleaseInstanceData,
            callback: DiscogsCallback<CollectionReleaseInstance>,
        ): DiscogsClient;
        editRelease(
            username: string,
            folderId: number | string,
            releaseId: number | string,
            instanceId: number | string,
            data: EditReleaseInstanceData,
        ): Promise<CollectionReleaseInstance>;

        removeRelease(
            username: string,
            folderId: number | string,
            releaseId: number | string,
            instanceId: number | string,
            callback: DiscogsCallback<any>,
        ): DiscogsClient; // 204 No Content
        removeRelease(
            username: string,
            folderId: number | string,
            releaseId: number | string,
            instanceId: number | string,
        ): Promise<any>;
    }

    interface WantlistRelease {
        id: number; // Release ID
        resource_url: string;
        rating: number; // 0-5
        date_added: string; // ISO 8601 datetime
        basic_information: Release; // Contains basic release info
        notes?: string;
    }
    type WantlistReleasesResponse = PaginatedResponse<WantlistRelease>;

    interface AddWantlistReleaseData {
        notes?: string;
        rating?: 0 | 1 | 2 | 3 | 4 | 5;
    }

    interface UserWantlist {
        getReleases(
            username: string,
            params: PaginationParams & SortParams,
            callback: DiscogsCallback<WantlistReleasesResponse>,
        ): DiscogsClient;
        getReleases(
            username: string,
            callback: DiscogsCallback<WantlistReleasesResponse>,
        ): DiscogsClient;
        getReleases(
            username: string,
            params?: PaginationParams & SortParams,
        ): Promise<WantlistReleasesResponse>;

        addRelease(
            username: string,
            releaseId: number | string,
            data: AddWantlistReleaseData,
            callback: DiscogsCallback<WantlistRelease>,
        ): DiscogsClient;
        addRelease(
            username: string,
            releaseId: number | string,
            callback: DiscogsCallback<WantlistRelease>,
        ): DiscogsClient;
        addRelease(
            username: string,
            releaseId: number | string,
            data?: AddWantlistReleaseData,
        ): Promise<WantlistRelease>;

        editNotes(
            username: string,
            releaseId: number | string,
            data: AddWantlistReleaseData,
            callback: DiscogsCallback<WantlistRelease>,
        ): DiscogsClient;
        editNotes(
            username: string,
            releaseId: number | string,
            data: AddWantlistReleaseData,
        ): Promise<WantlistRelease>;

        removeRelease(
            username: string,
            releaseId: number | string,
            callback: DiscogsCallback<any>,
        ): DiscogsClient; // 204 No Content
        removeRelease(
            username: string,
            releaseId: number | string,
        ): Promise<any>;
    }

    interface ListItem {
        // Structure varies greatly depending on what is in the list (releases, artists, etc.)
        id: string; // Can be "1_2_3" for release, "artist_123" for artist etc.
        type: "release" | "master" | "artist" | "label" | string; // Could be other types
        comment?: string;
        display_title: string; // e.g. "Artist - Title"
        uri: string;
        image_url?: string;
        resource_url: string;
        // ... more properties depending on item type
        item: { // Often contains the actual object (Release, Artist, etc.)
            id: number;
            // ... other properties of the item
        };
    }
    type ListItemsResponse = PaginatedResponse<ListItem> & UserList; // The response also includes list metadata

    interface UserListAPI {
        getItems(
            listId: number | string,
            params: PaginationParams,
            callback: DiscogsCallback<ListItemsResponse>,
        ): DiscogsClient;
        getItems(
            listId: number | string,
            callback: DiscogsCallback<ListItemsResponse>,
        ): DiscogsClient;
        getItems(
            listId: number | string,
            params?: PaginationParams,
        ): Promise<ListItemsResponse>;
    }
}
