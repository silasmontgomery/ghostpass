<template>
  <div>
    <div class="font-mono h-8 mb-1">
      <span class="text-gray-500">Ghostpass:</span> <span class="text-gray-700">Really secure passwords.</span>
      <a href="#" class="float-right" @click="addPassword = !addPassword"><i class="material-icons text-4xl">add_circle</i></a>
    </div>
    <div v-if="safe">
      <div class="mb-2">
        <input type="text" class="w-full appearance-none rounded border border-gray-400 p-2 mb-2 text-gray-700 leading-tight focus:outline-none" v-model="searchText" placeholder="Search" />
        <a href="#" class="tag" v-for="(tag, index) in safe.tags" :class="searchTags.findIndex(t => t.text == tag.text) > -1 ? 'selected':''" :key="index" @click.prevent="tagClick(tag)">{{ tag.text }}</a>
      </div>
      <div v-if="addPassword" class="card">
        <div>
          <label for="title">Title</label>
          <input id="title" ref="title" class="appearance-none w-full p-2 border border-gray-400 text-sm text-gray-700 leading-tight focus:outline-none" type="text" v-model="title" placeholder="Title" />
          <label for="username">Username</label>
          <input id="username" class="appearance-none w-full p-2 border border-gray-400 text-sm text-gray-700 leading-tight focus:outline-none" type="text" v-model="username" placeholder="Username" />
          <label for="password">Password</label>
          <input id="password" class="appearance-none w-full p-2 border border-gray-400 text-sm text-gray-700 leading-tight focus:outline-none" type="text" v-model="password" placeholder="Password" />
          <label for="tags">Tags</label>
          <vue-tags-input 
            id="tags"
            v-model="tag"
            :tags="tags"
            :autocomplete-items="filteredItems"
            @tags-changed="newTags => tags = newTags">
          </vue-tags-input>
        </div>
        <div class="mt-2">
          <button class="btn btn-sm btn-blue" :disabled="!title || !username || !password" @click="saveEntry">Save</button> 
          <button class="btn btn-sm btn-orange ml-2" @click="addPassword=false">Cancel</button>
        </div>
      </div>
      <div class="rounded-t pb-3 bg-white"></div>
      <div class="bg-white pl-4 pr-4 p-2" v-for="(password, index) in filteredPasswords" :key="index" :class="index < filteredPasswords.length-1 ? 'border-b border-gray-200':''">
        {{ password.title }}
      </div>
      <div class="bg-white rounded-b pl-4 pr-4 pt-3 pb-2">
        <div class="text-gray-700">
          Per Page: 
          <select class="bg-white border p-1 text-gray-700" v-model="perPage" @change="perPageChanged">
            <option>10</option>
            <option>25</option>
            <option>50</option>
            <option>100</option>
          </select>
          <span class="ml-2" v-if="pages > 1">
            Page: <a href="#" @click.prevent="currentPage > 1 ? currentPage-- : false">&lt;&lt;</a>
            <a href="#" v-for="page in pages" :key="page" class="mx-1" :class="currentPage == page ? 'font-bold':''" @click.prevent="currentPage=page">{{ page }}</a>
            <a href="#" @click.prevent="currentPage < pages ? currentPage++ : false">&gt;&gt;</a>
          </span>
        </div>
      </div>
    </div>
    <div v-if="!notFound && !safe" class="card">
      <h2>Enter a passphrase to decrypt this Ghostpass safe.</h2>
      <form @submit.prevent>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="passphrase">
            Passphrase
          </label>
          <input :class="error.passphrase ? 'border-red-500':''" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" v-model="passphrase" id="passphrase" type="password" placeholder="******************" autocomplete="new-password" />
          <p v-if="error.passphrase" class="text-red-500 text-xs italic">{{ error.passphrase }}</p>
        </div>
        <button :disabled="!passphrase || passphrase.length < 6" class="btn btn-blue" @click="decryptSafe">Decrypt and open safe</button>
      </form>
    </div>
    <div v-if="notFound" class="card">
      <h1 :class="notFound ? 'text-red-700':''">{{ notFound.status }} Error ({{ notFound.statusText }})</h1>
      <h2 v-if="notFound.data && notFound.data.error">{{ notFound.data.error }}</h2>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Safe',
  data: function() {
    return {
      uid: null,
      safe: null,
      encryptedSafe: null,
      passphrase: null,
      title: null,
      username: null,
      password: null,
      tag: '',
      tags: [],
      searchText: '',
      searchTags: [],
      currentPage: 1,
      perPage: 10,
      pages: 0,
      notFound: false,
      addPassword: false,
      error: {}
    }
  },
  mounted: function() {
    this.uid = this.$route.params.uid
    this.fetchSafe()
  },
  watch: {
    addPassword: function(value) {
      if(value) {
        this.$nextTick(() => this.$refs.title.focus())
      } else {
        this.title = null
        this.username = null
        this.password = null
        this.tags = []
      }
    }
  },
  computed: {
    filteredPasswords: function() {
      let results = this.safe.passwords;
      if(this.searchText.length > 0) {
        results = this.safe.passwords.filter(password => 
          password.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
          password.username.toLowerCase().includes(this.searchText.toLowerCase())
        )
      }
      this.searchTags.forEach(tag => {
        results = results.filter(r => r.tags.find(rt => rt.text == tag.text))
      })

      return results.slice((this.currentPage * this.perPage) - this.perPage, (this.currentPage * this.perPage))
    },
    filteredItems: function() {
      return this.safe.tags.filter(i => i.text.toLowerCase().includes(this.tag.toLowerCase()));
    },
  },
  methods: {
    fetchSafe: function() {
      this.$http.get('/api/safe/' + this.uid)
      .then((response) => {
        this.$emit('log', response)
        this.encryptedSafe = response.data.safe
      })
      .catch((error) => {
        console.log(error.response)
        this.notFound = error.response
      })
    },
    decryptSafe: function() {
      try {
        let bytes = this.$crypto.AES.decrypt(this.encryptedSafe, this.passphrase)
        this.safe = JSON.parse(bytes.toString(this.$crypto.enc.Utf8))
        this.pages = Math.ceil(this.safe.passwords.length / this.perPage)
      }
      catch(err) {
        this.$emit('flash', { message: 'Problem decrypting safe. Wrong password?', success: false })
        this.passphrase = null
      }
    },
    saveEntry: function() {
      let entry = {
        title: this.title,
        username: this.username,
        password: this.password,
        tags: this.tags
      }
      this.safe.passwords.push(entry)
      this.safe.passwords.sort((a, b) => (a.title > b.title) ? 1 : -1)
      this.addPassword = false
      this.saveSafe('Safe updated')
    },
    saveSafe: function(message) {
      this.updateTags();
      this.encryptedSafe = this.$crypto.AES.encrypt(JSON.stringify(this.safe), this.passphrase).toString()
      this.$http.put('/api/safe/' + this.uid, {
        uid: this.uid,
        safe: this.encryptedSafe
      })
      .then((response) => {
        console.log(response)
        this.$emit('flash', { message: message, success: true })
      })
      .catch((error) => {
        console.log(error.response)
      })
    },
    deleteEntry: function(delIndex) {
      if(confirm('Are you sure you want to delete this entry?')) {
        let passwords = []
        this.safe.passwords.forEach((password, index) => {
          if(delIndex != index) {
            passwords.push(password)
          }
        })
        this.safe.passwords = passwords;
        this.safe.passwords.sort((a, b) => (a.title > b.title) ? 1 : -1)
        this.saveSafe('Password deleted')
      }
    },
    updateTags: function() {
      this.safe.passwords.forEach(password => {
        password.tags.forEach(tag => {
          if(!this.safe.tags.find(t => t.text.toLowerCase() == tag.text.toLowerCase())) {
            this.safe.tags.push(tag)
          }
        })
      })
      this.safe.tags.sort((a, b) => (a > b) ? 1 : -1)
    },
    mask: function(text) {
      let masked = ''
      for(var i=0; i<text.length; i++) {
        masked += '*'
      }
      return masked;
    },
    tagClick: function(tag) {
      if(this.searchTags.findIndex(t => t.text == tag.text) == -1) {
        this.searchTags.push(tag)
      } else {
        this.searchTags = this.searchTags.filter(t => t.text != tag.text)
      }
    },
    copyToClipboard: function(text) {
      let el = document.createElement('textarea')
      el.value = text;
      el.setAttribute('readonly', '')
      el.style = {position: 'absolute', left: '-9999px'}
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy')
      document.body.removeChild(el)
      this.$emit('flash', { message: 'Copied to clipboard', success: true })
    },
    perPageChanged: function() {
      this.pages = Math.ceil(this.filteredPasswords.length / this.perPage)
      this.currentPage = 1
    }
  }
}
</script>
