<template>
  <div>
    <div class="card">
      <h2>What is it?</h2>
      <p>Ghostpass is a cloud-based password safe that uses only <a href="https://en.wikipedia.org/wiki/Client-side_encryption" target="_blank">client-side encryption</a> to keep your unencrypted information from being transmitted across the internet or stored on remote servers.</p>
    </div>
    <div class="card">
      <h2>Why use it?</h2>
      <p>Sending information across the internet and storing it on a remote server will always involve more risk than just keeping that information on your local device. However, by storing that information remotely you get the convenience of having access to it from other devices (desktop, mobile, tablet, etc).</p>
      <p>Ghostpass removes the major risks of storing your sensitive information remotely by always encrypting that information locally on your device before sending it to a remote server. The remote server has no access to the unencrypted information and cannot decrypt it because the passphrase used to encrypt and decrypt never leaves your local device.</p>
    </div>
    <div class="card">
      <h2>How does it work?</h2>
      <ul>
        <li>You choose a passphrase that will be used to encrypt/decrypt your password safe (local only).</li>
        <li>The remote server generates a unique url for your password safe from 6 random words.</li>
        <li>An new safe is generated locally, encrypted locally, and saved to the remote server.</li>
        <li>You are provided with a unique url to access your Ghostpass password safe.</li>
        <li>You are also provided with the 6 seed words used to retrieve your unique url in case you lose it.</li>
        <li>To access your safe you'll visit the unique URL and decrypt it locally using your passphrase.</li>
        <li>Anytime you make a change the safe is automatically encrypted and backed up to the remote server.</li>
      </ul>
    </div>
    <div class="mb-4"><button class="btn btn-blue" @click="$router.push('/new')">Create a new safe</button> -or- <button class="btn btn-orange" @click="$router.push('/retrieve')">Retrieve your URL</button></div>
  </div>
</template>

<script>
export default {
  name: 'Safe',
}
</script>
