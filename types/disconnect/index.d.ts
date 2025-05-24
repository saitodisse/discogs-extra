// Type definitions for disconnect
// Project: https://github.com/bartve/disconnect
// Definitions by: Your Name <your.email@example.com>

declare module "disconnect" {
    export class Client {
        constructor(userAgent?: string | AuthObject, authObject?: AuthObject);

        // Configuration
        setConfig(config: ClientConfig): Client;

        // Authentication
        authenticated(level?: number): boolean;

        // Core API modules
        database(): Database;
        marketplace(): Marketplace;
        user(): User;
        oauth(): OAuth;

        // Direct API access
        getIdentity(callback?: Callback<UserProfile>): Promise<UserProfile>;
        getIdentity(): Promise<UserProfile>;

        // Raw request methods (internal use)
        _rawRequest(options: RequestOptions, callback: Callback<any>): void;
        _request(
            options: RequestOptions,
            callback: Callback<any>,
        ): Promise<any>;
    }

    // Core types
    export interface AuthObject {
        userToken?: string;
        consumerKey?: string;
        consumerSecret?: string;
        method?: "oauth" | "discogs";
        level?: number;
        token?: string;
        tokenSecret?: string;
    }

    export interface ClientConfig {
        outputFormat?: "plaintext" | "html" | "discogs";
        requestLimit?: number;
        requestLimitAuth?: number;
        requestLimitInterval?: number;
        requestLimitIntervalAuth?: number;
        userAgent?: string;
    }

    export interface RequestOptions {
        url: string;
        method?: "GET" | "POST" | "PUT" | "DELETE";
        data?: any;
        encoding?: string;
        json?: boolean;
        authLevel?: number;
        queue?: boolean;
        headers?: Record<string, string>;
    }

    export interface RateLimit {
        limit: number;
        remaining: number;
        used: number;
        reset: number;
    }

    export interface Callback<T = any> {
        (error: Error | null, data?: T, rateLimit?: RateLimit): void;
    }

    // Database module
    export interface Database {
        getRelease(
            releaseId: number,
            callback?: Callback<Release>,
        ): Promise<Release>;
        getMasterRelease(
            masterId: number,
            callback?: Callback<MasterRelease>,
        ): Promise<MasterRelease>;
        getMasterVersions(
            masterId: number,
            params?: PaginationParams,
            callback?: Callback<PaginatedResponse<Version>>,
        ): Promise<PaginatedResponse<Version>>;
        getArtist(
            artistId: number,
            callback?: Callback<Artist>,
        ): Promise<Artist>;
        getArtistReleases(
            artistId: number,
            params?: PaginationParams,
            callback?: Callback<PaginatedResponse<ArtistRelease>>,
        ): Promise<PaginatedResponse<ArtistRelease>>;
        getLabel(labelId: number, callback?: Callback<Label>): Promise<Label>;
        getLabelReleases(
            labelId: number,
            params?: PaginationParams,
            callback?: Callback<PaginatedResponse<LabelRelease>>,
        ): Promise<PaginatedResponse<LabelRelease>>;
        search(
            query: string,
            params?: SearchParams,
            callback?: Callback<PaginatedResponse<SearchResult>>,
        ): Promise<PaginatedResponse<SearchResult>>;
        getImage(url: string, callback?: Callback<Buffer>): Promise<Buffer>;
    }

    // Marketplace module
    export interface Marketplace {
        getListing(
            listingId: number,
            callback?: Callback<Listing>,
        ): Promise<Listing>;
        getInventory(
            username: string,
            params?: InventoryParams,
            callback?: Callback<PaginatedResponse<InventoryItem>>,
        ): Promise<PaginatedResponse<InventoryItem>>;
        getOrder(orderId: string, callback?: Callback<Order>): Promise<Order>;
        getOrders(
            params?: OrderParams,
            callback?: Callback<PaginatedResponse<Order>>,
        ): Promise<PaginatedResponse<Order>>;
        getFee(
            price: number,
            currency: string,
            callback?: Callback<Fee>,
        ): Promise<Fee>;
        getFeeForListing(
            price: number,
            currency: string,
            releaseId: number,
            callback?: Callback<Fee>,
        ): Promise<Fee>;
        addListing(
            listing: NewListing,
            callback?: Callback<{ listing_id: number }>,
        ): Promise<{ listing_id: number }>;
        editListing(
            listingId: number,
            listing: Partial<NewListing>,
            callback?: Callback<void>,
        ): Promise<void>;
        deleteListing(
            listingId: number,
            releaseId: number,
            callback?: Callback<void>,
        ): Promise<void>;
    }

    // User module
    export interface User {
        collection(): Collection;
        wantlist(): Wantlist;
        list(): List;
        getProfile(
            username: string,
            callback?: Callback<UserProfile>,
        ): Promise<UserProfile>;
        getInventory(
            username: string,
            params?: InventoryParams,
            callback?: Callback<PaginatedResponse<InventoryItem>>,
        ): Promise<PaginatedResponse<InventoryItem>>;
        getOrders(
            username: string,
            params?: OrderParams,
            callback?: Callback<PaginatedResponse<Order>>,
        ): Promise<PaginatedResponse<Order>>;
        getOrder(orderId: string, callback?: Callback<Order>): Promise<Order>;
        getSubmissions(
            username: string,
            page?: number,
            perPage?: number,
            callback?: Callback<PaginatedResponse<Release>>,
        ): Promise<PaginatedResponse<Release>>;
        getContributions(
            username: string,
            page?: number,
            perPage?: number,
            callback?: Callback<PaginatedResponse<Release>>,
        ): Promise<PaginatedResponse<Release>>;
        getLists(
            username: string,
            page?: number,
            perPage?: number,
            callback?: Callback<PaginatedResponse<UserList>>,
        ): Promise<PaginatedResponse<UserList>>;
    }

    // Collection module
    export interface Collection {
        getFolders(
            username: string,
            callback?: Callback<Folder[]>,
        ): Promise<Folder[]>;
        getFolder(
            username: string,
            folderId: number,
            callback?: Callback<Folder>,
        ): Promise<Folder>;
        addFolder(
            username: string,
            name: string,
            callback?: Callback<{ id: number }>,
        ): Promise<{ id: number }>;
        editFolder(
            username: string,
            folderId: number,
            name: string,
            callback?: Callback<void>,
        ): Promise<void>;
        deleteFolder(
            username: string,
            folderId: number,
            callback?: Callback<void>,
        ): Promise<void>;
        getReleases(
            username: string,
            folderId: number,
            params?: PaginationParams,
            callback?: Callback<PaginatedResponse<CollectionItem>>,
        ): Promise<PaginatedResponse<CollectionItem>>;
        getRelease(
            username: string,
            folderId: number,
            releaseId: number,
            callback?: Callback<CollectionItem>,
        ): Promise<CollectionItem>;
        addRelease(
            releaseId: number,
            folderId?: number,
            notes?: string,
            rating?: number,
            callback?: Callback<{ instance_id: number }>,
        ): Promise<{ instance_id: number }>;
        editRelease(
            username: string,
            folderId: number,
            instanceId: number,
            data: { notes?: string; rating?: number },
            callback?: Callback<void>,
        ): Promise<void>;
        deleteRelease(
            username: string,
            folderId: number,
            releaseId: number,
            callback?: Callback<void>,
        ): Promise<void>;
    }

    // Wantlist module
    export interface Wantlist {
        getWants(
            username: string,
            params?: PaginationParams,
            callback?: Callback<PaginatedResponse<WantlistItem>>,
        ): Promise<PaginatedResponse<WantlistItem>>;
        wantRelease(
            releaseId: number,
            notes?: string,
            rating?: number,
            callback?: Callback<{ id: number }>,
        ): Promise<{ id: number }>;
        editNotes(
            releaseId: number,
            notes: string,
            rating?: number,
            callback?: Callback<void>,
        ): Promise<void>;
        remove(releaseId: number, callback?: Callback<void>): Promise<void>;
    }

    // List module
    export interface List {
        getLists(
            username: string,
            callback?: Callback<{ lists: UserList[] }>,
        ): Promise<{ lists: UserList[] }>;
        getList(
            username: string,
            listId: number,
            callback?: Callback<UserList>,
        ): Promise<UserList>;
        addList(
            name: string,
            description?: string,
            public?: boolean,
            callback?: Callback<{ id: number }>,
        ): Promise<{ id: number }>;
        editList(
            listId: number,
            data: { name?: string; description?: string; public?: boolean },
            callback?: Callback<void>,
        ): Promise<void>;
        deleteList(listId: number, callback?: Callback<void>): Promise<void>;
        getItems(
            listId: number,
            callback?: Callback<{ items: ListItem[] }>,
        ): Promise<{ items: ListItem[] }>;
        addItem(
            listId: number,
            type: "release" | "master" | "artist" | "label",
            id: number,
            notes?: string,
            callback?: Callback<{ id: number }>,
        ): Promise<{ id: number }>;
        editItem(
            listId: number,
            itemId: number,
            notes: string,
            callback?: Callback<void>,
        ): Promise<void>;
        deleteItem(
            listId: number,
            itemId: number,
            callback?: Callback<void>,
        ): Promise<void>;
    }

    // OAuth module
    export interface OAuth {
        getRequestToken(
            consumerKey: string,
            consumerSecret: string,
            callbackUrl: string,
            callback?: Callback<
                {
                    oauth_token: string;
                    oauth_token_secret: string;
                    oauth_authorize_url: string;
                }
            >,
        ): Promise<
            {
                oauth_token: string;
                oauth_token_secret: string;
                oauth_authorize_url: string;
            }
        >;
        getAccessToken(
            oauthToken: string,
            oauthTokenSecret: string,
            oauthVerifier: string,
            callback?: Callback<
                { oauth_token: string; oauth_token_secret: string }
            >,
        ): Promise<{ oauth_token: string; oauth_token_secret: string }>;
        authorize(
            url: string,
            method: string,
            oauthToken: string,
            oauthTokenSecret: string,
            callback?: Callback<any>,
        ): Promise<any>;
    }

    // Common interfaces
    export interface PaginationParams {
        page?: number;
        per_page?: number;
        sort?: string;
        sort_order?: "asc" | "desc";
    }

    export interface SearchParams extends PaginationParams {
        type?: "release" | "master" | "artist" | "label" | "all";
        title?: string;
        release_title?: string;
        credit?: string;
        artist?: string;
        anv?: string;
        label?: string;
        genre?: string;
        style?: string;
        country?: string;
        year?: string;
        format?: string;
        catno?: string;
        barcode?: string;
        track?: string;
        submitter?: string;
        contributor?: string;
        [key: string]: any;
    }

    export interface InventoryParams extends PaginationParams {
        status?: "for sale" | "sold" | "all";
        sort?:
            | "listed"
            | "artist"
            | "label"
            | "format"
            | "rating"
            | "title"
            | "catno"
            | "audio"
            | "country"
            | "year"
            | "added";
        sort_order?: "asc" | "desc";
    }

    export interface OrderParams extends PaginationParams {
        status?:
            | "All"
            | "New Order"
            | "Buyer Contacted"
            | "Invoice Sent"
            | "Payment Pending"
            | "Payment Received"
            | "Shipped"
            | "Merged"
            | "Order Changed"
            | "Cancelled (Non-Payer)"
            | "Cancelled"
            | "Cancelled (Refunded)"
            | "Cancelled (Item Unavailable)";
        sort?: "id" | "buyer" | "item_count" | "created" | "last_activity";
        sort_order?: "asc" | "desc";
    }

    export interface PaginatedResponse<T> {
        pagination: {
            page: number;
            pages: number;
            per_page: number;
            items: number;
            urls?: {
                first?: string;
                prev?: string;
                next?: string;
                last?: string;
            };
        };
        results: T[];
    }

    // Model interfaces (simplified - expand as needed)
    export interface Release {
        id: number;
        title: string;
        artists: Artist[];
        labels: Label[];
        formats: Format[];
        genres: string[];
        styles: string[];
        released: string;
        country: string;
        notes?: string;
        master_id: number | null;
        master_url: string | null;
        uri: string;
        resource_url: string;
        tracklist: Track[];
        images: Image[];
        year?: number;
        [key: string]: any;
    }

    export interface MasterRelease
        extends Omit<Release, "master_id" | "master_url"> {
        main_release: number;
        main_release_url: string;
        versions_url: string;
        num_for_sale: number;
        lowest_price: number | null;
        year?: number;
    }

    export interface Version {
        id: number;
        title: string;
        format: string;
        label: string;
        catno: string;
        status: string;
        released: string;
        country: string;
        major_formats: string[];
        resource_url: string;
        thumb: string;
        stats: {
            user: {
                in_collection: boolean;
                in_wantlist: boolean;
            };
        };
    }

    export interface Artist {
        id: number;
        name: string;
        realname?: string;
        profile?: string;
        releases_url?: string;
        resource_url: string;
        uri: string;
        urls?: string[];
        namevariations?: string[];
        images?: Image[];
        members?: Array<{
            id: number;
            name: string;
            active: boolean;
            resource_url: string;
        }>;
    }

    export interface Label {
        id: number;
        name: string;
        contact_info?: string;
        profile?: string;
        releases_url?: string;
        resource_url: string;
        uri: string;
        urls?: string[];
        images?: Image[];
        sublabels?: Array<{
            id: number;
            name: string;
            resource_url: string;
        }>;
    }

    export interface Format {
        name: string;
        qty: string;
        text?: string;
        descriptions?: string[];
    }

    export interface Track {
        position: string;
        title: string;
        duration: string;
        type_?: string;
        extraartists?: Artist[];
    }

    export interface Image {
        type: "primary" | "secondary" | "image";
        uri: string;
        resource_url: string;
        uri150: string;
        width: number;
        height: number;
    }

    export interface SearchResult {
        id: number;
        type: "release" | "master" | "artist" | "label";
        title: string;
        thumb: string;
        cover_image: string;
        resource_url: string;
        uri: string;
        country?: string;
        year?: string;
        format?: string[];
        label?: string[];
        catno?: string;
        barcode?: string[];
        master_id?: number;
        master_url?: string;
        genre?: string[];
        style?: string[];
        user_data?: {
            in_collection: boolean;
            in_wantlist: boolean;
        };
    }

    export interface UserProfile {
        id: number;
        username: string;
        resource_url: string;
        uri: string;
        name?: string;
        profile?: string;
        location?: string;
        registered?: string;
        website?: string;
        inventory_url?: string;
        collection_folders_url?: string;
        collection_fields_url?: string;
        wantlist_url?: string;
        avatar_url?: string;
        banner_url?: string;
        num_collection?: number;
        num_wantlist?: number;
        num_for_sale?: number;
        num_lists?: number;
        releases_contributed?: number;
        rating_avg?: number;
        releases_rated?: number;
        rank?: number;
    }

    export interface Folder {
        id: number;
        name: string;
        count: number;
        resource_url: string;
    }

    export interface CollectionItem {
        id: number;
        instance_id: number;
        date_added: string;
        rating: number;
        basic_information: {
            id: number;
            master_id: number | null;
            master_url: string | null;
            resource_url: string;
            title: string;
            year: number;
            artists: Artist[];
            labels: Label[];
            formats: Format[];
            genres: string[];
            styles: string[];
            thumb: string;
            cover_image: string;
        };
    }

    export interface CollectionItemInstance {
        id: number;
        instance_id: number;
        date_added: string;
        rating: number;
        folder_id: number;
    }

    export interface WantlistItem {
        id: number;
        rating: number;
        notes: string;
        basic_information: {
            id: number;
            master_id: number | null;
            master_url: string | null;
            resource_url: string;
            title: string;
            year: number;
            artists: Artist[];
            labels: Label[];
            formats: Format[];
            genres: string[];
            styles: string[];
            thumb: string;
            cover_image: string;
        };
    }

    export interface UserList {
        id: number;
        name: string;
        description: string;
        public: boolean;
        date_added: string;
        date_changed: string;
        resource_url: string;
        url: string;
        display_name: string;
        item_count: number;
    }

    export interface ListItem {
        id: number;
        type: "release" | "master" | "artist" | "label";
        display_title: string;
        notes: string;
        uri: string;
        resource_url: string;
        image_url: string;
        year: number;
    }

    export interface Listing {
        id: number;
        release_id: number;
        condition: string;
        status: "Draft" | "For Sale" | "Expired" | "Sold" | "Suspended";
        price: {
            currency: string;
            value: number;
        };
        allow_offers: boolean;
        sleeve_condition?: string;
        ships_from: string;
        posted: string;
        ships_to: string[];
        uri: string;
        comments: string;
        seller: {
            username: string;
            resource_url: string;
        };
        release: {
            id: number;
            description: string;
            resource_url: string;
            thumbnail: string;
            title: string;
            year: number;
            artist: string;
            format: string;
            label: string;
        };
    }

    export interface InventoryItem {
        id: number;
        status: "For Sale" | "Sold" | "Draft" | "Expired" | "Suspended";
        condition: string;
        sleeve_condition?: string;
        price: {
            currency: string;
            value: number;
        };
        allow_offers: boolean;
        posted: string;
        ships_from: string;
        uri: string;
        comments: string;
        seller: {
            username: string;
            resource_url: string;
        };
        release: {
            id: number;
            description: string;
            resource_url: string;
            thumbnail: string;
            title: string;
            year: number;
            artist: string;
            format: string;
            label: string;
        };
    }

    export interface Order {
        id: string;
        status: string;
        next_status: string[];
        fee: {
            currency: string;
            value: number;
        };
        shipping: string;
        shipping_address: string;
        additional_instructions: string;
        seller: {
            username: string;
            id: number;
        };
        buyer: {
            username: string;
            id: number;
        };
        created: string;
        last_activity: string;
        items: OrderItem[];
        uri: string;
        resource_url: string;
    }

    export interface OrderItem {
        id: number;
        release: {
            id: number;
            description: string;
            resource_url: string;
            thumbnail: string;
            title: string;
            year: number;
            artist: string;
            format: string;
            label: string;
        };
        price: {
            currency: string;
            value: number;
        };
        condition: string;
        sleeve_condition?: string;
        status: string;
        shipping_price?: {
            currency: string;
            value: number;
        };
    }

    export interface Fee {
        value: number;
        currency: string;
    }

    export interface NewListing {
        release_id: number;
        condition:
            | "Mint (M)"
            | "Near Mint (NM or M-)"
            | "Very Good Plus (VG+)"
            | "Very Good (VG)"
            | "Good Plus (G+)"
            | "Good (G)"
            | "Fair (F)"
            | "Poor (P)"
            | "Generic"
            | "Not Graded"
            | "No Cover";
        sleeve_condition?:
            | "Mint (M)"
            | "Near Mint (NM or M-)"
            | "Very Good Plus (VG+)"
            | "Very Good (VG)"
            | "Good Plus (G+)"
            | "Good (G)"
            | "Fair (F)"
            | "Poor (P)"
            | "Generic"
            | "Not Graded"
            | "No Cover";
        price: number;
        status?: "Draft" | "For Sale";
        comments?: string;
        allow_offers?: boolean;
        external_id?: string;
        location?: string;
        weight?: number;
        format_quantity?: number;
        ships_from?: string;
    }

    // Export the main client class as default
    const Disconnect: {
        new (userAgent?: string | AuthObject, authObject?: AuthObject): Client;
    };

    export default Disconnect;
}
