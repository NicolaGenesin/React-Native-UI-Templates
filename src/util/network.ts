import { retrieveTokens } from './auth';

export const searchArtistsOnSpotify = async (artistName: string) => {
  try {
    const response = await fetch(
      `https://f9b9-146-241-120-0.ngrok-free.app/api/artists?name=${encodeURIComponent(
        artistName,
      )}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Error searching for artists. Response not ok');
      return [];
    }
  } catch (error) {
    console.error('Error searching for artists');

    return [];
  }
};

export const searchSongsOnSpotify = async (
  songNames: string[],
  artistName: string,
) => {
  try {
    const response = await fetch(
      'https://f9b9-146-241-120-0.ngrok-free.app/api/songs',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songNames,
          artistName,
        }),
      },
    );

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Error searching for artists. Response not ok');
      return [];
    }
  } catch (error) {
    console.error('Error searching for songs');

    return [];
  }
};

export const searchArtistSetlistsOnFM = async (artistName: string) => {
  const apiKey = 'Y9sBv3Zzx7gxuYRlgxWDSXGYPytvfzdW0Fzo';

  try {
    const response = await fetch(
      `https://api.setlist.fm/rest/1.0/search/setlists?artistName=${encodeURIComponent(
        artistName,
      )}`,
      {
        headers: {
          'x-api-key': apiKey,
          Accept: 'application/json',
        },
      },
    );

    if (response.ok) {
      const data = await response.json();

      return data.setlist || [];
    } else {
      console.error('Error searching for setlists. Response not ok');
      return [];
    }
  } catch (error) {
    console.error('Error searching for setlists', error);
  }

  return [];
};

export const savePlaylistOnSpotify = async (
  songIds: string[],
  playlistName: string,
  imageUrl: string,
  artistName: string,
  venue: string,
  date: string,
) => {
  const { accessToken } = await retrieveTokens();

  // Step 1: Create Playlist
  const createPlaylistResponse = await fetch(
    'https://api.spotify.com/v1/me/playlists',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: playlistName,
        public: false,
      }),
    },
  );

  if (createPlaylistResponse.ok) {
    console.log('Playlist created.');

    const data: any = await createPlaylistResponse.json();
    const playlistId = data.id;

    // Step 2: Add Tracks to Playlist
    const addTracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: songIds.map((songId: string) => `spotify:track:${songId}`),
        }),
      },
    );

    if (addTracksResponse.ok) {
      console.log('Tracks added to playlist');
    } else {
      console.error('Error adding track to playlist');
    }

    // Step 3: Get Cover Image for Playlist
    const getCoverImageResponse = await fetch(
      'https://f9b9-146-241-120-0.ngrok-free.app/api/overlay',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          artistName,
          venue,
          date,
        }),
      },
    );

    if (getCoverImageResponse.ok) {
      console.log('Cover image created and returned to the client.');

      const blob = await getCoverImageResponse.blob();

      // Step 3: Convert the Blob to Base64 encoded string
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Step 4: Add Cover Image to Playlist
      const addCoverImageResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/images`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'image/jpeg',
          },
          body: base64,
        },
      );

      if (addCoverImageResponse.ok) {
        console.log('Cover added to playlist');
      } else {
        console.error(
          'Error adding cover to playlist',
          JSON.stringify(addCoverImageResponse),
        );
      }
    }
  }

  return false;
};

export const getPreviewOverlay = async (
  imageUrl: string,
  artistName: string,
  venue: string,
  date: string,
) => {
  console.log({
    imageUrl,
    artistName,
    venue,
    date,
  });

  const response = await fetch(
    'https://f9b9-146-241-120-0.ngrok-free.app/api/overlay',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        artistName,
        venue,
        date,
      }),
    },
  );

  if (response.ok) {
    console.log('[Preview] Cover image created and returned to the client.');

    const blob = await response.blob();

    // Step 3: Convert the Blob to Base64 encoded string
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return base64;
  }

  console.log('[Preview] Error creating preview cover.');

  return null;
};
