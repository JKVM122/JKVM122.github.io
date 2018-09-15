const version = 'v2';

//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var cacheName = 'sheets-cache';
var filesToCache = [
  '/index.html',
  '/history.html',
  '/style.css',
  '/history-javascript.js',
  '/javascript.js',
  '/icons/manifest.json',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
  'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/fonts/glyphicons-halflings-regular.woff2'
];

self.addEventListener('install', function(event) {
    console.log('SW %s installed at', version, new Date().toLocaleTimeString());
     event.waitUntil(
       caches.open(cacheName).then(function(cache) {
       console.log('[ServiceWorker] Caching app shell');
       return cache.addAll(filesToCache);
    })
  );
    
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('SW %s activated at', version, new Date().toLocaleTimeString());
    //event => event.waitUntil(self.clients.claim());it
});


self.addEventListener('fetch', function (event) {
   
         event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
});

self.addEventListener('sync', event => {
            if (event.tag === 'sync-transactions') {
                event.waitUntil(processSync());
            };
        });


       function processSync(){
           return new Promise((resolve, reject)=> {
                    var req = indexedDB.open('spreadsheets', 4)

                    req.onerror = console.error;

                    req.onsuccess = (event) => {

                        var db = event.target.result;
                        var transactions = db.transaction(['transactions'], 'readwrite').objectStore('transactions');
                        getData(transactions, t => t.isSync === false).then(data => {

                            //var transactions = db.transaction(['transactions'], 'readwrite').objectStore('transactions');

                            for (r of data) {
                                saveData(db, r);
                            }
                            
                            resolve();
                        });
                    };

                    //  });
                    //}
                }
       );
       };

       function saveData(db, r){
                                var value = r.value
                                var type = r.type;
                                var Run = '';
                                var Pushups = '';
                                var Situps = '';
                                
                                if(type == "Run")
                                    Run = value;
                                else if(type == "Pushups")
                                    Pushups = value;
                                else
                                    Situps = value;
           
                                var date = r.date;

                                var url = "https://script.google.com/macros/s/AKfycbz0mNqV93ijapjGYQnDfB8ruv4IT8xALb_ebUk8OlbO1ld3rRUV/exec?Run=" + run + "&Pushups=" + pushups + "&Situps=" + situps + "&Date=" + date;

                                fetch(url).then(res => {
                                    if (res.ok) {
                                        r.isSync = true;
                                        var tran = db.transaction(['transactions'], 'readwrite').objectStore('transactions').put(r);
                                        tran.onsuccess = () => {
                                           res.text().then(data => send_message_to_all_clients(data));
                                        };
                                        
                                        tran.onerror = (e) => { console.error(e)};
                                    }
                                });
       }

        function getData(objectStore, predicate) {
            return new Promise((resolve, reject) => {
                var t = [];

                function onsuccess(evt) {
                    var cursor = evt.target.result;

                    if (cursor) {
                        if (predicate(cursor.value)) {
                            t.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        resolve(t);
                    }
                }
                objectStore.openCursor().onsuccess = onsuccess;
            });
        }

    