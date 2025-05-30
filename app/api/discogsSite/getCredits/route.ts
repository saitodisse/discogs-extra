'use server'

import { NextRequest } from 'next/server'
import { GetCreditsResponse } from '@/types/discogs_site/GetCreditsResponse'

export async function GET(request: NextRequest) {
  // TODO: use playwright to get the credits from the Discogs site
  const searchParams = request.nextUrl.searchParams
  const artistId = searchParams.get('artistId')

  if (!artistId) {
    return Response.json({ error: 'Artist ID is required' }, { status: 400 })
  }

  const operationName = 'ArtistDiscographyData'

  const variables = {
    discogsId: parseInt(artistId),
    perPage: 500,
    sortDirection: 'ASC',
    headers: [{ headerName: 'Credits', headerType: 'CREDIT' }],
    creditCategory: 'Credits',
    desiredPage: 1,
    artistPages: [],
    creditName: '',
    formats: [],
    labels: [],
    years: [],
    countries: [],
    anvs: [],
    search: '',
    releaseTypes: [
      'Albums',
      'Singles & EPs',
      'Compilations',
      'Videos',
      'Miscellaneous',
      'Mixes',
      'DJ Mixes',
    ],
  }

  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash: 'c6edf5e07eee754d5703296fb090f54bef71630cf505382756f7916f3cfe6884',
    },
  }

  try {
    const response = await fetch(
      `https://www.discogs.com/service/catalog/api/graphql?operationName=${operationName}&variables=${encodeURIComponent(
        JSON.stringify(variables)
      )}&extensions=${encodeURIComponent(JSON.stringify(extensions))}`,
      {
        headers: {
          accept: '*/*',
          'accept-language': 'pt-BR,pt;q=0.9',
          'apollographql-client-name': 'release-page-client',
          'content-type': 'application/json',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
        method: 'GET',
      }
    )

    if (!response.ok) {
      return Response.json(
        { error: `Failed to fetch credits: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data: GetCreditsResponse = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Error fetching credits:', error)
    return Response.json({ error: 'Failed to fetch credits from Discogs' }, { status: 500 })
  }
}
