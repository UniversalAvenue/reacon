import React from 'react';

export default function Tagline(props) {
  const {
    children,
    ...rest,
  } = props;
  return (<p
    style={{
      color: 'black',
      fontSize: '24px',
      fontWeight: 200,
    }}
  >
    {children}
  </p>);
}
