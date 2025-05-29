// Type definitions for disconnect 1.2.2
// Project: https://github.com/bartve/disconnect
// Definitions by: Gemini <https://github.com/gemini>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node" />

declare module 'disconnect' {
  // #region Utility Namespace and Classes
  export namespace util {
    /**
     * Strip the trailing number from a Discogs artist name Artist (2) -> Artist
     */
    function stripVariation(name: string): string

    /**
     * Add params to a given url or path
     */
    function addParams(url: string, data?: Record<string, any>): string

    /**
     * Escape a string for use in a query string
     */
    function escape(str: string): string

    /**
     * Deep merge two objects
     */
    function merge<T extends object, U extends object>(target: T, source: U): T & U
    function merge(target: any, source: any): any

    export class Queue {
      constructor(customConfig?: Partial<QueueConfig>)
      setConfig(customConfig: Partial<QueueConfig>): this
      add(
        callback: (
          err: DiscogsError | null,
          freeCallsRemaining?: number,
          freeStackPositionsRemaining?: number
        ) => void
      ): this
      clear(): this
    }
  }
  // #endregion

  // #region Error Classes
  export class DiscogsError extends Error {
    statusCode: number
    constructor(statusCode?: number, message?: string)
    toString(): string
  }

  export class AuthError extends DiscogsError {
    constructor()
  }
  // #endregion

  // #region Core Interfaces (Auth, Config, Callbacks, Options)
  export interface DiscogsAuthMethodDiscogs {
    method: 'discogs'
    userToken?: string
    consumerKey?: string
    consumerSecret?: string
    level?: 0 | 1 | 2
  }

  export interface DiscogsAuthMethodOAuth {
    method: 'oauth'
    consumerKey: string
    consumerSecret: string
    token?: string
    tokenSecret?: string
    authorizeUrl?: string
    level?: 0 | 1 | 2
  }

  export type DiscogsAuth = DiscogsAuthMethodDiscogs | DiscogsAuthMethodOAuth

  export interface DiscogsClientConfig {
    host: string
    port: number
    userAgent: string
    apiVersion: string
    outputFormat: 'discogs' | 'plaintext' | 'html'
    requestLimit: number
    requestLimitAuth: number
    requestLimitInterval: number // in milliseconds
  }

  export interface QueueConfig {
    maxStack: number
    maxCalls: number
    interval: number // in milliseconds
  }

  export interface RateLimitInfo {
    limit: number
    used: number
    remaining: number
  }

  export type DiscogsCallback<TData = any> = (
    err: DiscogsError | AuthError | null,
    data?: TData,
    rateLimit?: RateLimitInfo | null
  ) => void

  export interface RequestOptions {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    authLevel?: 0 | 1 | 2
    encoding?: BufferEncoding
    queue?: boolean
    json?: boolean
  }

  export interface PaginationParams {
    page?: number
    per_page?: number
  }

  export interface SortParams {
    sort?: string
    sort_order?: 'asc' | 'desc'
  }

  export interface PaginatedResponse<TItem> {
    pagination: {
      page: number
      pages: number
      per_page: number
      items: number
      urls: {
        last?: string
        next?: string
      }
    }
    results: TItem[]
  }
  // #endregion

  // #region Data Structure Interfaces
  export interface Identity {
    id: number
    username: string
    resource_url: string
    consumer_name: string
  }

  export interface AboutInfo {
    disconnect: {
      version: string
      userAgent: string
      authMethod: string
      authLevel: number
    }
    api_version: string
    documentation_url: string
    hello: string
  }

  export interface ArtistStub {
    id: number
    name: string
    resource_url: string
    anv?: string
    join?: string
    role?: string
    roles?: {
      role: string
      tracks?: string | string[]
    }[]
    tracks?: string
  }

  export interface Image {
    type: 'primary' | 'secondary'
    uri: string
    resource_url: string
    uri150: string
    width: number
    height: number
  }

  export interface Alias extends ArtistStub {}
  export interface Member extends ArtistStub {}
  export interface Group extends ArtistStub {}

  export interface Artist {
    id: number
    name: string
    realname?: string
    resource_url: string
    uri: string
    releases_url: string
    images?: Image[]
    profile?: string
    urls?: string[]
    namevariations?: string[]
    aliases?: Alias[]
    members?: Member[]
    groups?: Group[]
    data_quality?: string
  }

  export interface LabelStub {
    id: number
    name: string
    resource_url: string
    catno?: string
    entity_type?: string
    entity_type_name?: string
  }
  export interface CompanyStub extends LabelStub {}

  export interface Format {
    name: string
    qty: string
    text?: string
    descriptions?: string[]
  }

  export interface Track {
    position: string
    type_: string
    title: string
    duration?: string
    artists?: ArtistStub[]
    extraartists?: ArtistStub[]
    is_on_master?: boolean
    extra_track?: boolean
  }

  export interface Video {
    uri: string
    title: string
    description?: string
    duration?: number
    embed?: boolean
  }

  export interface Identifier {
    type: string
    value: string
    description?: string
  }

  export interface UserStub {
    username: string
    resource_url: string
  }

  export interface CommunityReleaseInfo {
    status?: string
    rating: {
      count: number
      average: number
    }
    have: number
    want: number
    submitter?: UserStub
    contributors?: UserStub[]
    data_quality?: string
  }

  export interface Release {
    id: number
    title: string
    resource_url: string
    uri: string
    status?: string
    data_quality?: string
    master_id?: number
    master_url?: string
    year?: number
    released?: string
    released_formatted?: string
    country?: string
    notes?: string
    styles?: string[]
    genres?: string[]
    images?: Image[]
    artists?: ArtistStub[]
    extraartists?: ArtistStub[]
    labels?: LabelStub[]
    companies?: CompanyStub[]
    formats?: Format[]
    tracklist?: Track[]
    videos?: Video[]
    identifiers?: Identifier[]
    community?: CommunityReleaseInfo
  }

  export interface MasterRelease {
    id: number
    main_release: number
    main_release_url: string
    resource_url: string
    uri: string
    versions_url: string
    title: string
    year: number
    artists: ArtistStub[]
    genres: string[]
    styles?: string[]
    images?: Image[]
    tracklist: Track[]
    data_quality: string
    videos?: Video[]
  }

  export interface Label {
    id: number
    name: string
    profile?: string
    releases_url: string
    resource_url: string
    uri: string
    urls?: string[]
    images?: Image[]
    sublabels?: LabelStub[]
    parent_label?: LabelStub
    data_quality?: string
    contact_info?: string
  }

  export interface ReleaseRating {
    username: string
    release_id: number
    rating: number
  }

  export interface DatabaseSearchItemBase {
    id: number
    resource_url: string
    uri: string
    type: 'release' | 'master' | 'artist' | 'label'
    title: string
    thumb: string
    cover_image: string
    user_data?: {
      in_wantlist?: boolean
      in_collection?: boolean
    }
  }
  export interface DatabaseSearchReleaseItem extends DatabaseSearchItemBase {
    type: 'release'
    catno?: string
    year?: string
    genre?: string[]
    style?: string[]
    country?: string
    format?: string[]
    label?: string[]
    barcode?: string[]
    community?: {
      want?: number
      have?: number
    }
  }
  export interface DatabaseSearchMasterItem extends DatabaseSearchItemBase {
    type: 'master'
    catno?: string
    year?: string
    genre?: string[]
    style?: string[]
    country?: string
    format?: string[]
    label?: string[]
    barcode?: string[]
    community?: {
      want?: number
      have?: number
    }
  }
  export interface DatabaseSearchArtistItem extends DatabaseSearchItemBase {
    type: 'artist'
  }
  export interface DatabaseSearchLabelItem extends DatabaseSearchItemBase {
    type: 'label'
    catno?: string
  }

  export type DatabaseSearchItem =
    | DatabaseSearchReleaseItem
    | DatabaseSearchMasterItem
    | DatabaseSearchArtistItem
    | DatabaseSearchLabelItem
  export type DatabaseSearchResponse = PaginatedResponse<DatabaseSearchItem>
  export interface DatabaseSearchParams extends PaginationParams, SortParams {
    q?: string
    type?: 'release' | 'master' | 'artist' | 'label'
    title?: string
    release_title?: string
    credit?: string
    artist?: string
    anv?: string
    label?: string
    genre?: string
    style?: string
    country?: string
    year?: string
    format?: string
    catno?: string
    barcode?: string
    track?: string
    submitter?: string
    contributor?: string
  }

  export interface MarketplaceListing {
    id: number
    resource_url: string
    uri: string
    status: string
    price: {
      value: number
      currency: string
    }
    allow_offers: boolean
    sleeve_condition: string
    condition: string
    posted: string
    ships_from: string
    comments?: string
    seller: UserStub
    release: {
      id: number
      resource_url: string
      description: string
      thumbnail: string
      format: string
      catno: string
      year: number
    }
  }

  export interface CreateListingData {
    release_id: number
    condition: string
    sleeve_condition?: string
    price: number
    status: 'For Sale' | 'Draft'
    comments?: string
    allow_offers?: boolean
    external_id?: string
    location?: string
    weight?: number
    format_quantity?: number
  }
  export interface EditListingData extends Partial<CreateListingData> {}

  export interface MarketplaceOrder {
    id: string
    resource_url: string
    status: string
    buyer: UserStub
    created: string
    last_activity: string
    total: {
      value: number
      currency: string
    }
    shipping: {
      value: number
      currency: string
    }
    items: Array<{
      id: number
      price: {
        value: number
        currency: string
      }
      release: {
        id: number
        description: string
        thumbnail: string
      }
    }>
  }
  export interface EditOrderData {
    status?: string
    shipping?: number
  }

  export interface OrderMessage {
    message: string
    order_id: string
    subject: string
    timestamp: string
    from: UserStub
  }
  export interface AddOrderMessageData {
    message?: string
    status?: string
  }

  export interface Fee {
    value: number
    currency: string
  }
  export interface PriceSuggestion {
    [condition: string]: {
      value: number
      currency: string
    }
  }
  export interface InventoryItem extends MarketplaceListing {}
  export type InventoryResponse = PaginatedResponse<InventoryItem>
  export interface InventoryParams extends PaginationParams, SortParams {
    status?: 'For Sale' | 'Draft' | 'Expired' | 'Sold' | 'Violates Policies' | string
  }
  export interface MarketplaceOrdersParams extends PaginationParams, SortParams {
    status?: string
    archived?: boolean
  }

  export interface UserProfile {
    id: number
    username: string
    name?: string
    home_page?: string
    location?: string
    profile?: string
    registered: string
    rank?: number
    num_pending: number
    num_for_sale: number
    num_lists: number
    releases_contributed: number
    releases_rated: number
    rating_avg: number
    inventory_url: string
    collection_folders_url: string
    collection_fields_url: string
    wantlist_url: string
    avatar_url: string
    curr_abbr: string
    activated: boolean
    marketplace_suspended: boolean
    banner_url?: string
    buyer_rating: number
    buyer_rating_stars: number
    buyer_num_ratings: number
    seller_rating: number
    seller_rating_stars: number
    seller_num_ratings: number
  }

  export interface UserContribution {
    id: number
    resource_url: string
    status: string
  }
  export type UserContributionsResponse = PaginatedResponse<UserContribution>

  export interface UserSubmission {
    id: number
    resource_url: string
    title: string
  }
  export type UserSubmissionsResponse = PaginatedResponse<UserSubmission>

  export interface UserList {
    id: number
    name: string
    public: boolean
    date_added: string
    date_changed: string
    uri: string
    resource_url: string
    image_url?: string
    description?: string
    user: UserStub
  }
  export type UserListsResponse = PaginatedResponse<UserList>

  export interface CollectionFolder {
    id: number
    name: string
    count: number
    resource_url: string
  }
  export type CollectionFoldersResponse = { folders: CollectionFolder[] }

  export interface CollectionRelease {
    id: number
    instance_id: number
    folder_id: number
    rating: number
    date_added: string
    basic_information: Release
  }
  export type CollectionReleasesResponse = PaginatedResponse<CollectionRelease>

  export interface CollectionReleaseInstance {
    id: number
    instance_id: number
    folder_id: number
    rating: number
    date_added: string
  }
  export type CollectionReleaseInstancesResponse = PaginatedResponse<CollectionReleaseInstance>

  export interface EditReleaseInstanceData {
    rating?: number
    folder_id?: number
    [fieldId: string]: any
  }

  export interface WantlistRelease {
    id: number
    resource_url: string
    rating: number
    date_added: string
    basic_information: Release
    notes?: string
  }
  export type WantlistReleasesResponse = PaginatedResponse<WantlistRelease>

  export interface AddWantlistReleaseData {
    notes?: string
    rating?: 0 | 1 | 2 | 3 | 4 | 5
  }

  export interface ListItem {
    id: string
    type: 'release' | 'master' | 'artist' | 'label' | string
    comment?: string
    display_title: string
    uri: string
    image_url?: string
    resource_url: string
    item: {
      id: number
    }
  }
  export type ListItemsResponse = PaginatedResponse<ListItem> & UserList
  // #endregion

  // #region OAuth Class and Constructor Auth Interface
  export interface DiscogsOAuthConstructorAuth {
    method: 'oauth'
    consumerKey?: string
    consumerSecret?: string
    token?: string
    tokenSecret?: string
    authorizeUrl?: string
    level?: 0 | 1 | 2
  }

  export class DiscogsOAuth {
    constructor(auth?: DiscogsOAuthConstructorAuth)
    config: {
      requestTokenUrl: string
      accessTokenUrl: string
      authorizeUrl: string
      version: string
      signatureMethod: 'PLAINTEXT' | 'HMAC-SHA1'
    }
    auth: DiscogsOAuthConstructorAuth

    setConfig(customConfig: Partial<DiscogsOAuth['config']>): this
    getRequestToken(
      consumerKey: string,
      consumerSecret: string,
      callbackUrl: string,
      callback?: (
        err: Error | null,
        authData: DiscogsOAuthConstructorAuth & {
          authorizeUrl: string
        }
      ) => void
    ): this
    getAccessToken(
      verifier: string,
      callback?: (err: Error | null, authData: DiscogsOAuthConstructorAuth) => void
    ): this
    export(): DiscogsOAuthConstructorAuth
    toHeader(requestMethod: string, url: string): string
  }
  // #endregion

  // #region Sub-Client API Shape Interfaces
  export interface Database {
    status: {
      accepted: 'Accepted'
      draft: 'Draft'
      deleted: 'Deleted'
      rejected: 'Rejected'
    }

    getArtist(artistId: number | string, callback: DiscogsCallback<Artist>): Client
    getArtist(artistId: number | string): Promise<Artist>

    getArtistReleases(
      artistId: number | string,
      params: PaginationParams & SortParams,
      callback: DiscogsCallback<ArtistReleasesResponse>
    ): Client
    getArtistReleases(
      artistId: number | string,
      callback: DiscogsCallback<ArtistReleasesResponse>
    ): Client
    getArtistReleases(
      artistId: number | string,
      params?: PaginationParams & SortParams
    ): Promise<ArtistReleasesResponse>

    getRelease(releaseId: number | string, callback: DiscogsCallback<Release>): Client
    getRelease(releaseId: number | string): Promise<Release>

    getReleaseRating(
      releaseId: number | string,
      username: string,
      callback: DiscogsCallback<ReleaseRating>
    ): Client
    getReleaseRating(releaseId: number | string, username: string): Promise<ReleaseRating>

    setReleaseRating(
      releaseId: number | string,
      username: string,
      rating: number | null,
      callback: DiscogsCallback<ReleaseRating | ''>
    ): Client
    setReleaseRating(
      releaseId: number | string,
      username: string,
      rating: number | null
    ): Promise<ReleaseRating | ''>

    getMaster(masterId: number | string, callback: DiscogsCallback<MasterRelease>): Client
    getMaster(masterId: number | string): Promise<MasterRelease>

    /**
     * Get the release versions contained in the given master release
     * The response includes pagination, filters, filter_facets, and versions.
     */
    getMasterVersions(
      masterId: number | string,
      params: PaginationParams,
      callback: DiscogsCallback<MasterVersionsResponse>
    ): Client
    getMasterVersions(
      masterId: number | string,
      callback: DiscogsCallback<MasterVersionsResponse>
    ): Client
    getMasterVersions(
      masterId: number | string,
      params?: PaginationParams
    ): Promise<MasterVersionsResponse>

    getLabel(labelId: number | string, callback: DiscogsCallback<Label>): Client
    getLabel(labelId: number | string): Promise<Label>

    getLabelReleases(
      labelId: number | string,
      params: PaginationParams & SortParams,
      callback: DiscogsCallback<PaginatedResponse<Release>>
    ): Client
    getLabelReleases(
      labelId: number | string,
      callback: DiscogsCallback<PaginatedResponse<Release>>
    ): Client
    getLabelReleases(
      labelId: number | string,
      params?: PaginationParams & SortParams
    ): Promise<PaginatedResponse<Release>>

    getImage(imageUrl: string, callback: DiscogsCallback<Buffer>): Client
    getImage(imageUrl: string): Promise<Buffer>

    search(
      query: string,
      params: DatabaseSearchParams,
      callback: DiscogsCallback<DatabaseSearchResponse>
    ): Client
    search(query: string, callback: DiscogsCallback<DatabaseSearchResponse>): Client
    search(query: string, params?: DatabaseSearchParams): Promise<DatabaseSearchResponse>
    search(params: DatabaseSearchParams, callback: DiscogsCallback<DatabaseSearchResponse>): Client
    search(params: DatabaseSearchParams): Promise<DatabaseSearchResponse>
  }

  export interface Marketplace {
    getInventory(
      username: string,
      params: InventoryParams,
      callback: DiscogsCallback<InventoryResponse>
    ): Client
    getInventory(username: string, callback: DiscogsCallback<InventoryResponse>): Client
    getInventory(username: string, params?: InventoryParams): Promise<InventoryResponse>

    getListing(listingId: number | string, callback: DiscogsCallback<MarketplaceListing>): Client
    getListing(listingId: number | string): Promise<MarketplaceListing>

    addListing(data: CreateListingData, callback: DiscogsCallback<MarketplaceListing>): Client
    addListing(data: CreateListingData): Promise<MarketplaceListing>

    editListing(
      listingId: number | string,
      data: EditListingData,
      callback: DiscogsCallback<MarketplaceListing>
    ): Client
    editListing(listingId: number | string, data: EditListingData): Promise<MarketplaceListing>

    deleteListing(listingId: number | string, callback: DiscogsCallback<any>): Client
    deleteListing(listingId: number | string): Promise<any>

    getOrders(
      params: MarketplaceOrdersParams,
      callback: DiscogsCallback<PaginatedResponse<MarketplaceOrder>>
    ): Client
    getOrders(callback: DiscogsCallback<PaginatedResponse<MarketplaceOrder>>): Client
    getOrders(params?: MarketplaceOrdersParams): Promise<PaginatedResponse<MarketplaceOrder>>

    getOrder(orderId: string, callback: DiscogsCallback<MarketplaceOrder>): Client
    getOrder(orderId: string): Promise<MarketplaceOrder>

    editOrder(
      orderId: string,
      data: EditOrderData,
      callback: DiscogsCallback<MarketplaceOrder>
    ): Client
    editOrder(orderId: string, data: EditOrderData): Promise<MarketplaceOrder>

    getOrderMessages(
      orderId: string,
      params: PaginationParams,
      callback: DiscogsCallback<PaginatedResponse<OrderMessage>>
    ): Client
    getOrderMessages(
      orderId: string,
      callback: DiscogsCallback<PaginatedResponse<OrderMessage>>
    ): Client
    getOrderMessages(
      orderId: string,
      params?: PaginationParams
    ): Promise<PaginatedResponse<OrderMessage>>

    addOrderMessage(
      orderId: string,
      data: AddOrderMessageData,
      callback: DiscogsCallback<OrderMessage>
    ): Client
    addOrderMessage(orderId: string, data: AddOrderMessageData): Promise<OrderMessage>

    getFee(price: number | string, currency: string, callback: DiscogsCallback<Fee>): Client
    getFee(price: number | string, callback: DiscogsCallback<Fee>): Client
    getFee(price: number | string, currency?: string): Promise<Fee>

    getPriceSuggestions(
      releaseId: number | string,
      callback: DiscogsCallback<PriceSuggestion>
    ): Client
    getPriceSuggestions(releaseId: number | string): Promise<PriceSuggestion>
  }

  export interface UserCollection {
    getFolders(username: string, callback: DiscogsCallback<CollectionFoldersResponse>): Client
    getFolders(username: string): Promise<CollectionFoldersResponse>

    getFolder(
      username: string,
      folderId: number | string,
      callback: DiscogsCallback<CollectionFolder>
    ): Client
    getFolder(username: string, folderId: number | string): Promise<CollectionFolder>

    addFolder(username: string, name: string, callback: DiscogsCallback<CollectionFolder>): Client
    addFolder(username: string, name: string): Promise<CollectionFolder>

    setFolderName(
      username: string,
      folderId: number | string,
      name: string,
      callback: DiscogsCallback<CollectionFolder>
    ): Client
    setFolderName(
      username: string,
      folderId: number | string,
      name: string
    ): Promise<CollectionFolder>

    deleteFolder(
      username: string,
      folderId: number | string,
      callback: DiscogsCallback<any>
    ): Client
    deleteFolder(username: string, folderId: number | string): Promise<any>

    getReleases(
      username: string,
      folderId: number | string,
      params: PaginationParams & SortParams,
      callback: DiscogsCallback<CollectionReleasesResponse>
    ): Client
    getReleases(
      username: string,
      folderId: number | string,
      callback: DiscogsCallback<CollectionReleasesResponse>
    ): Client
    getReleases(
      username: string,
      folderId: number | string,
      params?: PaginationParams & SortParams
    ): Promise<CollectionReleasesResponse>

    getReleaseInstances(
      username: string,
      releaseId: number | string,
      callback: DiscogsCallback<CollectionReleaseInstancesResponse>
    ): Client
    getReleaseInstances(
      username: string,
      releaseId: number | string
    ): Promise<CollectionReleaseInstancesResponse>

    addRelease(
      username: string,
      releaseId: number | string,
      callback: DiscogsCallback<CollectionReleaseInstance>
    ): Client
    addRelease(username: string, releaseId: number | string): Promise<CollectionReleaseInstance>
    addRelease(
      username: string,
      folderId: number | string,
      releaseId: number | string,
      callback: DiscogsCallback<CollectionReleaseInstance>
    ): Client
    addRelease(
      username: string,
      folderId: number | string,
      releaseId: number | string
    ): Promise<CollectionReleaseInstance>

    editRelease(
      username: string,
      folderId: number | string,
      releaseId: number | string,
      instanceId: number | string,
      data: EditReleaseInstanceData,
      callback: DiscogsCallback<CollectionReleaseInstance>
    ): Client
    editRelease(
      username: string,
      folderId: number | string,
      releaseId: number | string,
      instanceId: number | string,
      data: EditReleaseInstanceData
    ): Promise<CollectionReleaseInstance>

    removeRelease(
      username: string,
      folderId: number | string,
      releaseId: number | string,
      instanceId: number | string,
      callback: DiscogsCallback<any>
    ): Client
    removeRelease(
      username: string,
      folderId: number | string,
      releaseId: number | string,
      instanceId: number | string
    ): Promise<any>
  }

  export interface UserWantlist {
    getReleases(
      username: string,
      params: PaginationParams & SortParams,
      callback: DiscogsCallback<WantlistReleasesResponse>
    ): Client
    getReleases(username: string, callback: DiscogsCallback<WantlistReleasesResponse>): Client
    getReleases(
      username: string,
      params?: PaginationParams & SortParams
    ): Promise<WantlistReleasesResponse>

    addRelease(
      username: string,
      releaseId: number | string,
      callback: DiscogsCallback<WantlistRelease>
    ): Client
    addRelease(username: string, releaseId: number | string): Promise<WantlistRelease>
    addRelease(
      username: string,
      releaseId: number | string,
      data: AddWantlistReleaseData,
      callback: DiscogsCallback<WantlistRelease>
    ): Client
    addRelease(
      username: string,
      releaseId: number | string,
      data: AddWantlistReleaseData
    ): Promise<WantlistRelease>

    editNotes(
      username: string,
      releaseId: number | string,
      data: AddWantlistReleaseData,
      callback: DiscogsCallback<WantlistRelease>
    ): Client
    editNotes(
      username: string,
      releaseId: number | string,
      data: AddWantlistReleaseData
    ): Promise<WantlistRelease>

    removeRelease(
      username: string,
      releaseId: number | string,
      callback: DiscogsCallback<any>
    ): Client
    removeRelease(username: string, releaseId: number | string): Promise<any>
  }

  export interface UserListAPI {
    getItems(
      listId: number | string,
      params: PaginationParams,
      callback: DiscogsCallback<ListItemsResponse>
    ): Client
    getItems(listId: number | string, callback: DiscogsCallback<ListItemsResponse>): Client
    getItems(listId: number | string, params?: PaginationParams): Promise<ListItemsResponse>
  }

  export interface User {
    getProfile(username: string, callback: DiscogsCallback<UserProfile>): Client
    getProfile(username: string): Promise<UserProfile>

    getInventory(
      username: string,
      params: InventoryParams,
      callback: DiscogsCallback<InventoryResponse>
    ): Client
    getInventory(username: string, callback: DiscogsCallback<InventoryResponse>): Client
    getInventory(username: string, params?: InventoryParams): Promise<InventoryResponse>

    getIdentity(callback: DiscogsCallback<Identity>): Client // Note: Client.getIdentity also exists
    getIdentity(): Promise<Identity>

    collection(): UserCollection
    wantlist(): UserWantlist
    list(): UserListAPI

    getContributions(
      username: string,
      params: PaginationParams & SortParams,
      callback: DiscogsCallback<UserContributionsResponse>
    ): Client
    getContributions(username: string, callback: DiscogsCallback<UserContributionsResponse>): Client
    getContributions(
      username: string,
      params?: PaginationParams & SortParams
    ): Promise<UserContributionsResponse>

    getSubmissions(
      username: string,
      params: PaginationParams,
      callback: DiscogsCallback<UserSubmissionsResponse>
    ): Client
    getSubmissions(username: string, callback: DiscogsCallback<UserSubmissionsResponse>): Client
    getSubmissions(username: string, params?: PaginationParams): Promise<UserSubmissionsResponse>

    getLists(
      username: string,
      params: PaginationParams,
      callback: DiscogsCallback<UserListsResponse>
    ): Client
    getLists(username: string, callback: DiscogsCallback<UserListsResponse>): Client
    getLists(username: string, params?: PaginationParams): Promise<UserListsResponse>
  }
  // #endregion

  // #region Main Client Class (Exported as Client)
  export class Client {
    constructor(userAgent?: string | DiscogsAuth, auth?: DiscogsAuth)

    config: DiscogsClientConfig
    auth?: DiscogsAuth

    setConfig(customConfig: Partial<DiscogsClientConfig>): this
    authenticated(level?: 0 | 1 | 2): boolean

    getIdentity(callback: DiscogsCallback<Identity>): this
    getIdentity(): Promise<Identity>

    about(callback: DiscogsCallback<AboutInfo>): this
    about(): Promise<AboutInfo>

    get<TData = any>(options: string | RequestOptions, callback: DiscogsCallback<TData>): this
    get<TData = any>(options: string | RequestOptions): Promise<TData>

    post<TData = any>(
      options: string | RequestOptions,
      data: any,
      callback: DiscogsCallback<TData>
    ): this
    post<TData = any>(options: string | RequestOptions, data: any): Promise<TData>

    put<TData = any>(
      options: string | RequestOptions,
      data: any,
      callback: DiscogsCallback<TData>
    ): this
    put<TData = any>(options: string | RequestOptions, data: any): Promise<TData>

    delete<TData = any>(options: string | RequestOptions, callback: DiscogsCallback<TData>): this
    delete<TData = any>(options: string | RequestOptions): Promise<TData>

    oauth(): DiscogsOAuth
    database(): Database
    marketplace(): Marketplace
    user(): User
  }
  // #endregion
}

/**
 * The response type for getMasterVersions, matching Discogs API JSON structure.
 */
export interface MasterVersionsResponse {
  pagination: {
    page: number
    pages: number
    per_page: number
    items: number
    urls: {
      last?: string
      next?: string
    }
  }
  filters: {
    applied: Record<string, any>
    available: {
      format?: Record<string, number>
      label?: Record<string, number>
      country?: Record<string, number>
      released?: Record<string, number>
    }
  }
  filter_facets: Array<{
    title: string
    id: string
    values: Array<{
      title: string
      value: string
      count: number
    }>
    allows_multiple_values: boolean
  }>
  versions: Array<{
    id: number
    label: string
    country: string
    title: string
    major_formats: string[]
    format: string
    catno: string
    released: string
    status: string
    resource_url: string
    thumb: string
    stats: {
      community: {
        in_wantlist: number
        in_collection: number
      }
    }
  }>
}

export interface ArtistRelease {
  id: number
  title: string
  type: 'master' | 'release'
  main_release?: number
  artist: string
  role: string
  resource_url: string
  year: number
  thumb: string
  stats: {
    community: {
      in_wantlist: number
      in_collection: number
    }
  }
  // Release specific fields
  status?: string
  format?: string
  label?: string
  // Master specific fields
}

export interface ArtistReleasesResponse {
  pagination: {
    page: number
    pages: number
    per_page: number
    items: number
    urls: {
      last?: string
      next?: string
    }
  }
  releases: ArtistRelease[]
}
