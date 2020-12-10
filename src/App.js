import { useEffect, useRef, useState, useContext, createContext } from 'react';
import './App.css';
import Sipgate from './Sipgate';

/** @type {React.Context<Sipgate>} */
const SipgateContext = createContext(null);

function App() {
  const { current: sipgate } = useRef(new Sipgate());
  const [ devices, setDevices ] = useState(/** @type {Device[]} */([]));
  const [ phoneLines, setPhoneLines ] = useState(/** @type {PhoneLine[]} */([]));
  // const [ numberMap, setNumberMap ] = useState(/** @type {{ [phoneLineId: string]: PhoneNumber[] }} */({}));
  const [ page, setPage ] = useState("devices");

  useEffect(() => {
    if (sipgate.isAuthenticated()) {
      sipgate.getDevices().then(setDevices);

      sipgate.getPhoneLines().then(phoneLines => {
        setPhoneLines(phoneLines);

        for (const phoneLine of phoneLines) {
          sipgate.getNumbers(phoneLine.id).then(numbers => {
            setPhoneLines(phoneLines => phoneLines.map(p => p.id === phoneLine.id ? { ...p, numbers } : p ));
          });

          sipgate.getPhoneLineDevices(phoneLine.id).then(devices => {
            setPhoneLines(phoneLines => phoneLines.map(p => p.id === phoneLine.id ? { ...p, devices } : p ));
          });
        }
      });
    }
  }, [sipgate]);

  if (!sipgate.isAuthenticated()) {
    return <a href={sipgate.getLoginURL()}>Login</a>;
  }

  return (
    <SipgateContext.Provider value={sipgate}>
      <div className="App">
        <div>
          Logged In
          <button onClick={() => { sipgate.logout(); window.location.reload(); }}>Logout</button>
        </div>
        { page === "devices" ? <button onClick={() => setPage("phone-lines")}>Phone Lines</button> : <button onClick={() => setPage("devices")}>Devices</button> }

        { page === "devices" &&
          <ul className="DeviceList">
            {
              devices.map(d => <li key={d.id}><Device device={d} phoneLines={phoneLines} /></li>)
            }
          </ul>
        }
        { page === "phone-lines" &&
          <ul className="PhoneLineList">
            {
              phoneLines.map(p => <li key={p.id}><PhoneLine phoneLine={p} /></li>)
            }
          </ul>
        }
      </div>
    </SipgateContext.Provider>
  );
}

function PhoneLine ({ phoneLine }) {
  return (
    <div className="PhoneLine">
      <h1>Phone Line: {phoneLine.alias}</h1>
      { phoneLine.numbers &&
        <PhoneNumbers numbers={phoneLine.numbers} />
      }
      { phoneLine.devices &&
        <div className="Devices">
          <h2>Devices</h2>
          <ul className="DeviceList">
            {
              phoneLine.devices.map(d => <li key={d.id}><Device device={d} /></li>)
            }
          </ul>
        </div>
      }
    </div>
  )
}

/**
 *
 * @param {{ device: Device, phoneLines?: PhoneLine[] }} param0
 */
function Device ({ device, phoneLines }) {
  const sipgate = useContext(SipgateContext);

  /**
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  function handleFormSubmit (e) {
    e.preventDefault();
    const data = new FormData(e.target);
    sipgate.newCall(device.id, data.get("phone-number").toString());
    e.target.reset()
  }

  return (
    <div className="Device">
      <h1>Device: {device.alias}</h1>
      <dl>
        <dt>Type</dt>
        <dd>{device.type}</dd>
        { device.type === "REGISTER" &&
          <>
            <dt>Username</dt>
            <dd>{device.credentials.username}</dd>
            <dt>Password</dt>
            <dd>{device.credentials.password}</dd>
            <dt>SIP Server</dt>
            <dd>{device.credentials.sipServer}</dd>
          </>
        }
      </dl>
      { phoneLines &&
        <div className="PhoneLines">
          <h2>Phone Lines</h2>
          <ul>{device.activePhonelines.map(apl => {
            const phoneLine = phoneLines.find(p => p.id === apl.id);
            const numbers = phoneLine?.numbers;
            return (
              <li key={apl.id} className="PhoneLine">
                <h1>{apl.alias}</h1>
                { numbers &&
                  <PhoneNumbers numbers={numbers} />
                }
              </li>
            );
          })}</ul>
        </div>
      }
      { device.type === "REGISTER" &&
        <div className="RegisteredDevices">
          <h2>Registered Devices</h2>
          <ul>{device.registered.map(r => <li key={`${r.ip}:${r.port}`} className="RegisteredDevice" title={`${r.ip}:${r.port}`}>{r.userAgent}</li>)}</ul>
        </div>
      }
      <h2>Initiate Call</h2>
      <form onSubmit={handleFormSubmit}>
        <input type="tel" name="phone-number" placeholder="Phone Number" />
        <button>Call</button>
      </form>
    </div>
  );
}

function PhoneNumbers({ numbers }) {
  return (
    <div className="PhoneNumbers">
      <h2>Phone Numbers</h2>
      <ul className="NumbersList">
        {numbers.map(n => <li key={n.id} title={n.number}>{n.type === "LANDLINE" ? "🏠 " : "📱 "}{n.localized}</li>)}
      </ul>
    </div>
  );
}

export default App;