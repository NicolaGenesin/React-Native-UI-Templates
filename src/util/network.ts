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
  console.log(
    JSON.stringify({
      songNames,
      artistName,
    }),
  );

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
