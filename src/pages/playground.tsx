import { useEffect, useState } from 'react';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { useDeckList } from '@/hooks/useDeckList';
import { cardRegistry } from '@/registry';
import { CardDefinitionBase, ZombalsRequest, zZombalsResponse } from '@/types';
import { cardJobNameMap, cardPackNameMap, cardRarityNameMap, Job } from '@/types/common';

export default function App() {
  const [session, reloadSession] = useCurrentSession();
  const [decks, reloadDecks] = useDeckList();
  const [cards, setCards] = useState<CardDefinitionBase[] | null>(null);

  const [messages, setMessages] = useState<string[]>([]);

  const connectToLobby = () => {
    if (!decks) {
      alert('No decks!');
      return;
    }

    const ws = new WebSocket('ws://' + location.host + '/ws');
    const send = (req: ZombalsRequest) => ws.send(JSON.stringify(req));

    ws.addEventListener('open', () => {
      setMessages((messages) => [...messages, 'OPENED']);
      send({ type: 'LOBBY_ENTER', clientVersion: '1.0.0', deckId: decks[0].id });
    });
    ws.addEventListener('message', (ev) => {
      console.log('Received', ev.data);
      setMessages((messages) => [...messages, 'Received: ' + ev.data]);

      const response = zZombalsResponse.parse(JSON.parse(ev.data));
      if (response.type === 'GAME_WAITING') {
        send({ type: 'GAME_START' });
      }
    });
    ws.addEventListener('error', (e) => {
      console.error(e);
    });
  };

  const handleSubmitRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get('name');
    fetch('/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        reloadSession();
      });
  };

  const [formName, setFormName] = useState('');
  const [formLoginId, setFormLoginId] = useState('');
  const [formPassword, setFormPassword] = useState('');

  useEffect(() => {
    setFormName(session?.name || '');
    setFormLoginId(session?.loginId || '');
  }, [session]);

  const handleSubmitUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetch('/api/user/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: formName }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        reloadSession();
      });
  };

  const handleIdentifySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetch('/api/user/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loginId: formLoginId, password: formPassword }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        reloadSession();
      });
  };

  const handleLogout = () => {
    fetch('/api/session/logout', {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        reloadSession();
      });
  };

  const handleIdentifyLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const loginId = data.get('loginId');
    const password = data.get('password');
    fetch('/api/session/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loginId, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        reloadSession();
      });
  };

  const handleCreateDeck = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get('name');
    const job = parseInt(data.get('job')?.toString() ?? '1', 10);
    const cardDefIdList = data.get('cardDefIdList');

    const arrayCardDefList = cardDefIdList
      ?.toString()
      .split(',')
      .map((s) => parseInt(s.trim(), 10));

    fetch('/api/deck/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, job, cardDefIds: arrayCardDefList }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        reloadDecks();
      });
  };

  useEffect(() => {
    const cards = [...cardRegistry.scanAll()];
    cards.sort((a, b) => a.id - b.id);
    setCards(cards);
  }, []);

  return (
    <>
      <p>
        Session: <pre>{JSON.stringify(session, null, 2)}</pre>
      </p>

      <button onClick={connectToLobby}>Matching</button>

      {messages.map((m, index) => (
        <p key={index}>{m}</p>
      ))}

      <h3>User API</h3>

      <form onSubmit={handleSubmitRegister}>
        <p>Register</p>
        <input type="text" name="name" defaultValue="" />
        <button type="submit">Submit</button>
      </form>

      <form onSubmit={handleSubmitUpdate}>
        <p>Update</p>
        <input
          type="text"
          name="name"
          value={formName}
          onChange={(ev) => {
            setFormName(ev.target.value);
          }}
        />
        <button type="submit">Submit</button>
      </form>

      <form onSubmit={handleIdentifySubmit}>
        <p>Identify</p>
        <input
          type="text"
          name="loginId"
          value={formLoginId}
          onChange={(ev) => {
            setFormLoginId(ev.target.value);
          }}
          placeholder="loginId"
        />
        <input
          type="password"
          name="password"
          value={formPassword}
          onChange={(ev) => {
            setFormPassword(ev.target.value);
          }}
          placeholder="password"
        />
        <button type="submit">Submit</button>
      </form>

      <button onClick={handleLogout}>Log out</button>

      <form onSubmit={handleIdentifyLogin}>
        <p>Log in</p>
        <input type="text" name="loginId" defaultValue="" placeholder="loginId" />
        <input type="password" name="password" defaultValue="" placeholder="password" />
        <button type="submit">Submit</button>
      </form>

      <h3>Deck API</h3>

      <form onSubmit={handleCreateDeck}>
        <p>Create Deck</p>

        <input type="text" name="name" defaultValue="" placeholder="Deck name" />

        <select name="job" defaultValue={Job.WARRIOR}>
          <option value={Job.WARRIOR}>WARRIOR</option>
          <option value={Job.WIZARD}>WIZARD</option>
          <option value={Job.FIGHTER}>FIGHTER</option>
          <option value={Job.PRIEST}>PRIEST</option>
          <option value={Job.MERCHANT}>MERCHANT</option>
          <option value={Job.FORTUNE}>FORTUNE</option>
          <option value={Job.EVIL}>EVIL</option>
          <option value={Job.THIEF}>THIEF</option>
        </select>

        <textarea name="cardDefIdList" defaultValue="" placeholder="1,2,3,3,4,4,5.." cols={60} rows={4}></textarea>

        <button type="submit">Submit</button>
      </form>

      <p>Decks</p>

      <pre>{JSON.stringify(decks, null, 2)}</pre>

      <p>Cards</p>

      <table border={1}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Job</th>
            <th>Cost</th>
            <th>Description</th>
            <th>Rarity</th>
            <th>Pack</th>
          </tr>
        </thead>
        <tbody>
          {cards?.map((card) => (
            <tr key={card.id}>
              <td>{card.id}</td>
              <td>{card.name.ja}</td>
              <td>{cardJobNameMap[card.job].ja}</td>
              <td>{card.cost}</td>
              <td>{card.description.ja}</td>
              <td>{cardRarityNameMap[card.rarity].ja}</td>
              <td>{cardPackNameMap[card.pack].ja}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
