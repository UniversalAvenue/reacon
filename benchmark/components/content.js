import React from 'react';

import Title from './title';
import Tagline from './tagline';
import Button from './button';

export default function Content(props) {
  const {
    title,
    tagline,
    children,
    button,
  } = props;
  return (<section>
    {title && <Title>{title}</Title>}
    {tagline && <Tagline>{tagline}</Tagline>}
    {button && <Button>{Button}</Button>}
    {cildren}
  </section>);
}
