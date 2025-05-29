export type GetCreditsResponse = {
  data: {
    artist: {
      discogsId: number
      name: string
      facets: {
        artistCreditFacets: {
          facets: Array<{
            superFacetName: string
            totalCount: number
            facetDetails: Array<{
              facetName: string
              totalCount: number
              subFacetDetails: Array<{
                subFacetName: string
                totalCount: number
                __typename: string
              }>
              __typename: string
            }>
            __typename: string
          }>
          __typename: string
        }
        __typename: string
      }
      releases: {
        artistCreditFacets: {
          facets: Array<{
            superFacetName: string
            totalCount: number
            facetDetails: Array<{
              facetName: string
              totalCount: number
              subFacetDetails: Array<{
                subFacetName: string
                totalCount: number
                __typename: string
              }>
              __typename: string
            }>
            __typename: string
          }>
          __typename: string
        }
        releaseGroups: {
          releaseGroupsByHeader: Array<{
            header: {
              headerName: string
              __typename: string
            }
            releaseGroupDescriptions: Array<{
              orderByValue: string
              releaseCount: number
              keyRelease: {
                discogsId: number
                title: string
                siteUrl: string
                released?: string
                formats: Array<{
                  name: string
                  quantity: string
                  description: Array<string>
                  text?: string
                  __typename: string
                }>
                primaryArtists: Array<{
                  displayName: string
                  joiningText: string
                  nameVariation?: string
                  artist: {
                    discogsId: number
                    siteUrl: string
                    name: string
                    __typename: string
                  }
                  __typename: string
                }>
                releaseCredits: Array<{
                  displayName: string
                  creditRole: string
                  __typename: string
                }>
                tracks: Array<{
                  id: string
                  title: string
                  trackCredits: Array<{
                    displayName: string
                    __typename: string
                  }>
                  primaryArtists: Array<{
                    displayName: string
                    __typename: string
                  }>
                  subTracks?: Array<{
                    title: string
                    id: string
                    primaryArtists: Array<any>
                    __typename: string
                  }>
                  __typename: string
                }>
                masterRelease?: {
                  discogsId: number
                  siteUrl: string
                  inUserCollectionCount: number
                  inUserWantlistCount: number
                  myListings: {
                    totalCount: number
                    __typename: string
                  }
                  __typename: string
                }
                collectionItems: any
                inWantlist: any
                labels: Array<{
                  displayName: string
                  catalogNumber: string
                  labelRole: string
                  label: {
                    discogsId: number
                    name: string
                    siteUrl: string
                    __typename: string
                  }
                  __typename: string
                }>
                images: {
                  edges: Array<{
                    node: {
                      id: string
                      tiny: {
                        sourceUrl: string
                        webpUrl: string
                        width: number
                        height: number
                        __typename: string
                      }
                      fullsize: {
                        sourceUrl: string
                        webpUrl: string
                        width: number
                        height: number
                        __typename: string
                      }
                      thumbnail: {
                        sourceUrl: string
                        webpUrl: string
                        width: number
                        height: number
                        __typename: string
                      }
                      nsfw: boolean
                      __typename: string
                    }
                    __typename: string
                  }>
                  __typename: string
                }
                __typename: string
              }
              __typename: string
            }>
            __typename: string
          }>
          paginationInfo: Array<
            Array<{
              header: {
                headerName: string
                headerType: string
                __typename: string
              }
              keyReleaseIds: Array<number>
              __typename: string
            }>
          >
          __typename: string
        }
        __typename: string
      }
      __typename: string
    }
  }
}
