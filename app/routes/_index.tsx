import { useState } from 'react';

export default function Index() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
      <p id="index-page">
        This is a demo for Remix.
        <br />
        Check out{" "}
        <a href="https://remix.run">the docs at remix.run</a>.
      </p>
      
    );
  }
  