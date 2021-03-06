import Connection from '../src/administrative-sdk/connection/connection-controller';
import Controller from '../src/administrative-sdk/pronunciation-challenge/pronunciation-challenge-controller';
import PronunciationChallenge from '../src/administrative-sdk/pronunciation-challenge/pronunciation-challenge';

describe('PronunciationChallenge object test', () => {
  it('should not construct with an invalid id', () => {
    [0, {}, [], true, false].map(v => {
      expect(() => {
        new PronunciationChallenge(v);
      }).toThrowError('id parameter of type "string|null" is required');
    });
  });

  it('should not construct with an invalid transcription', () => {
    [0, {}, [], true, false].map(v => {
      expect(() => {
        new PronunciationChallenge('0', v);
      }).toThrowError('transcription parameter of type "string" is required');
    });
  });

  it('should not construct with an invalid referenceAudioUrl', () => {
    [0, {}, [], true, false].map(v => {
      expect(() => {
        new PronunciationChallenge('0', 'tr', v);
      }).toThrowError('referenceAudioUrl parameter of type "string|null" is required');
    });
  });

  it('should instantiate a PronunciationChallenge', () => {
    const audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';

    const s = new PronunciationChallenge('test', 'hi', audioUrl);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.transcription).toBe('hi');
    expect(s.referenceAudioUrl).toBe(audioUrl);

    const s2 = new PronunciationChallenge(undefined, 'hi', undefined);
    expect(s2).toBeDefined();
    expect(s2.id).toBeNull();
    expect(s2.transcription).toBe('hi');
    expect(s2.referenceAudioUrl).toBeNull();
  });

  it('should instantiate a PronunciationChallenge wihtout referenceAudio', () => {
    const s = new PronunciationChallenge('test', 'hi');
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.transcription).toBe('hi');
    expect(s.referenceAudioUrl).toBeNull();
  });
});

describe('PronunciationChallenge API interaction test', () => {
  const api = new Connection({
    oAuth2Token: 'token'
  });
  const controller = new Controller(api);
  const blob = new Blob(['1234567890']);
  const referenceAudioUrl = 'https://api.itslanguage.nl/download' +
    '/YsjdG37bUGseu8-bsJ';
  let url;


  beforeEach(() => {
    spyOn(FormData.prototype, 'append');

    url = 'https://api.itslanguage.nl/challenges/pronunciation';
  });

  it('should not create on invalid challenge', done => {
    [0, '0', {}, [], true, false, null, undefined].map(v => {
      controller.createPronunciationChallenge(v)
        .then(() => {
          fail('An error should be thrown');
        })
        .catch(error => {
          expect(error.message).toEqual('challenge parameter of type "PronunciationChallenge" is required');
        })
        .then(done);
    });
  });

  it('should check for required referenceAudio field', done => {
    const challenge = new PronunciationChallenge('1', 'test', referenceAudioUrl);
    controller.createPronunciationChallenge(challenge, null)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('audioBlob parameter of type "Blob" is required');
      })
      .then(done);
  });

  it('should create a new pronunciation challenge through API', done => {
    const challenge = new PronunciationChallenge('1', 'test', referenceAudioUrl);
    const content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'test',
      referenceAudioUrl,
      status: 'preparing'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 202,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.createPronunciationChallenge(challenge, blob)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(challenge));
        const stringDate = '2014-12-31T23:59:59Z';
        const outChallenge = new PronunciationChallenge('1', 'test', referenceAudioUrl);
        outChallenge.created = new Date(stringDate);
        outChallenge.updated = new Date(stringDate);
        outChallenge.status = 'preparing';
        expect(result).toEqual(outChallenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should create a new pronunciation challenge through API without an id', done => {
    const challenge = new PronunciationChallenge(null, 'test', referenceAudioUrl);
    const content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'test',
      referenceAudioUrl,
      status: 'preparing'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 202,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.createPronunciationChallenge(challenge, blob)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(challenge));
        const stringDate = '2014-12-31T23:59:59Z';
        const outChallenge = new PronunciationChallenge('1', 'test', referenceAudioUrl);
        outChallenge.created = new Date(stringDate);
        outChallenge.updated = new Date(stringDate);
        outChallenge.status = 'preparing';
        expect(result).toEqual(outChallenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should not get when missing challenge id', done => {
    controller.getPronunciationChallenge()
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challengeId field is required');
      })
      .then(done);
  });

  it('should get an existing pronunciation challenge', done => {
    url = 'https://api.itslanguage.nl/challenges/pronunciation/4';
    const content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'Hi',
      referenceAudioUrl,
      status: 'prepared'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.getPronunciationChallenge('4')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const challenge = new PronunciationChallenge('4', 'Hi', referenceAudioUrl);
        challenge.created = new Date(stringDate);
        challenge.updated = new Date(stringDate);
        challenge.status = 'prepared';
        expect(result).toEqual(challenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing challenges', done => {
    const content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'Hi',
      referenceAudioUrl,
      status: 'prepared'
    }];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.getPronunciationChallenges('fb')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const challenge = new PronunciationChallenge('4', 'Hi', referenceAudioUrl);
        challenge.created = new Date(stringDate);
        challenge.updated = new Date(stringDate);
        challenge.status = 'prepared';
        expect(result[0]).toEqual(challenge);
        expect(result.length).toBe(1);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should reject when deleting a challenge without id', done => {
    controller.deletePronunciationChallenge()
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challengeId field is required');
      })
      .then(done);
  });

  it('should delete a an existing challenge', done => {
    const challenge = new PronunciationChallenge('test', 'hi', referenceAudioUrl);
    url = 'https://api.itslanguage.nl/challenges/pronunciation/test';

    const content =
      {
        status: 204,
        contentType: 'application/json; charset=utf-8'
      };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.deletePronunciationChallenge(challenge.id)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('DELETE');
        expect(result).toEqual(challenge.id);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should not delete a non existing challenge', done => {
    const challenge = new PronunciationChallenge('test', 'hi', referenceAudioUrl);
    const content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'PronunciationChallenge',
          field: 'id',
          code: 'missing'
        }
      ]
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 422,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.deletePronunciationChallenge(challenge.id)
      .then(() => {
        fail('An error should be a thrown');
      })
      .catch(error => {
        const errors = [{
          resource: 'PronunciationChallenge',
          field: 'id',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);
      })
      .then(done);
  });
});
