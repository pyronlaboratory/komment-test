const elements = () => {
  return (
    <div>
      {(!select && !logged) && <div onClick={() => { }}>abc</div>}
      <a><b onClick={() => { }}></b></a>
    </div>
  )
}

const elements = () => {
  return (
    <div>
      {!condition && (
        <div onClick={() => { }}>
          <span>Click me</span>
        </div>
      )}
      <div>
        <button onClick={() => { }}>Nested Click</button>
      </div>
    </div>
  );
};

const elements = () => {
  return (
    <div>
      {condition ? (
        <button onClick={() => { }}>Click me</button>
      ) : (
        <div>
          <p>Conditional content</p>
          <a href="#">Link</a>
        </div>
      )}
      <ul>
        <li onClick={() => { }}>Item 1</li>
        <li>Item 2</li>
      </ul>
    </div>
  );
};

const elements = () => {
  return (
    <div>
      {isLoggedIn ? (
        <button onClick={() => { }}>Logout</button>
      ) : (
        <div>
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button onClick={() => { }}>Login</button>
        </div>
      )}
      <ul>
        {items.map((item, index) => (
          <li key={index} onClick={() => { }}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
