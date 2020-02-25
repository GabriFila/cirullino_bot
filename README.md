# cirullino_bot
Un bot di telegram per giocare a cirulla con gli amici.

Questo bot è scritto in JavaScript ed utilizza il framework [Telegraf.js](https://telegraf.js.org/#/). Questo framework è molto capace ma ha una documentazione molto povera e mal strutturata. Avrei preferito scrivere il codice in TypeScript ma, anche in questo caso, il supporto lascia desiderare. Si presuppone però un refactoring generale del codice in TypeScript

Ho scelto di realizzare un bot per evitare di progettare e realizzare elementi come autenticazione ee front-end.
# Part I - funzionamento

## Evoluzione di un gioco

1. A, B e C avviano il bot con **/start**
   - se A, B o C non possiedono uno username il bot chiede di rieseguire **/start** quando avranno fatto le giuste modifiche.
2. A utilizza il comando **/sfida** per iniziare una nuova partita
3. Il bot chiede ad A con quante persone vuole giocare
4. A deve rispondere un numero tra 1 e 3
5. Il bot chiede ad A di inviare singolarmente gli username degli altri giocatori, in questo caso B e C
6. Il bot controlla che tutti i giocatori abbiano avviato il bot
   - se così non fosse il bot lo comunica ad A e gli invia il link al bot agli altri utenti.
7.  Il bot manda un messaggio a B e C avvisandoli dell'invito a giocare da parte di A
8. Se B e C rispondono entrambi **/enter** il gioco incomincia
    - B e/o C possono scegliere di rispondere **/rifiuta** per non entrare in gioco con A
    - se così fosse A e/o B e/o C vengono avvisati che B e/o C hanno rifiutato
9. il bot avvisa tutti i giocatori che il gioco è cominciato, comunicando chi da li carte e chi inizia.
10. ogni giocatore rivece un messaggio con le carte in tavola, il numero delle proprie scope e il numero di carte nel proprio mazzetto.
11. Ogni giocatore riceve le carte della propria mano come pulsanti al posto della tastiera
    - se il giocatore di turno può bussare viene mostrato anche il pulsante 'bussa'. In caso di bussata il bot controlla che effettivamente il giocatore sia di turno e che possa bussare. Se così fosse il bot comunica agli altri giocatori lo stato del gioco e la mano dei giocatori che hanno bussato.
12. il giocatore di turno deve giocare una carta mandandola al bot
    - se il giocatore gioca una carta che non ha in mano il bot lo informa dell'errore e lo invita a inviarne un'altra
    - se il giocatore gioca una carta ma non è il suo turno il bot lo informa di cioà e lo inviata ad attendere
13. il giocatore visualizza le possibili prese come pulsanti al posto della tastiera e manda la scelta al bot
    - se il giocatore manda una presa non valida il bot lo informa di ciò e lo invita ad inviarne un'altra  
14. il bot informa gli altri giocatori della mossa di chi ha giocato e manda il nuovo stato del gioco
15. Il bot dice ai giocatori chi è di turno
16. Ogni volta che una mano termina il bot informa i giocatori delle numero di mani restanti
17. In punti 10-16 si ripetono finche le carte nel mazzo non finiscono
18. Alla fine del gioco il bot comunica ai giocatori i punti accumulati e annuncia il vincitore

## Comandi

| comando       | descrizione                          |
| ------------- | ------------------------------------ |
| **/start**    | avvio del bot                        |
| **/sfida**    | inizio di una nuova partita          |
| **/entra**    | partecipare ad un gioco su invito    |
| **/rifiuta**  | rifiutare l'invito a un gioco        |
| **/esci**     | uscire dal gioco                     |
| **/status**   | visualliza le statische di gioco     |
| **/tutorial** | come giocare a cirulla               |
| **/aiuto**    | info sui comandi del bot             |
| **/privacy**  | info sulla privacyy dei dati del bot |
| **/info**     | info sul bot                         |
| **/stop**     | arresto del bot                      |

## Messaggi dell'utente
Il bot interagisce anche ad altri messaggi da parter dell'utente, non solo comandi.

| testo   | descrizione          |
| ------- | -------------------- |
| carta   | mossa di gioco       |
| bussare | tentativo di bussata |


# Part II - implementazione
Un bot di Telegram è, alle sue basi, una web API. Ogni volta che viene mandato un messaggio questo viene inoltrato a un server tramite un webhook, viene processato e viene inviata indietro una risposta all'utente. Nel caso di Cirullino mi sono affidato a [Telegraf.js](https://telegraf.js.org/#/) per astrarre il concetto di web API e gestire il bot a un livello più alto. Il bot è un'instanza su Heroku sulla quale gira un'applicazione Node.js.

Il framework prevede che il bot reagisca a input da parte dell'utente. Quando il bot riceve un messaggio può rispondere e concludere la conversazione immediatamente oppure intrattenere una conversaione più lunga entrando in un percorso di scene. Nella mia implementazione le scene vengono usate anche per dividere in modo più logico le funzioni del bot. I comandi che richiedono una logica pià elaborati seguono un percorso di scene ben definito.

Dato che il bot deve essere il più indipendente possibile dai dati e dallo stato del gioco ha senso utilizzare un database per persistere i dati. Utilizzando Heroku è molto immediato appoggiarsi a Redis. In Cirullino Redis viene utilizzato solo per ricordare le info sugli utenti e sui giochi attivi. Tutto il resto:  dati su giochi passati, statistiche, etc dovranno essere immagazzinati su un'altro DB, per ora si pensa un'istanza di MongoDB Atlas, ma verrà decisio in futuro. Questa scelta ha l'obbiettivo di mantenere le dimensione e la complessità del DB redis al minimo per garantire elevate performance.

## Basic command handlers

#### /help
- reply with help message

#### /privacy
- reply with privacy message

#### /about
- reply with about message

#### /tutorial
- reply with tutorial message

#### /info
- reply with info message

#### /status
need to think about stats DB then implement command

#### /start
- check if user has username 
- if so impostare userID of user in db
- else ask him to set it and then resend /start

## Advanced Commands

#### /play
- update userId in db (user could have changed his username)
- TODO delete old usernames
- ask how many players want to play
- user responds O (#Opponents)
  - if not number betweem 1 and 3 keep waiting for number
- O times
  - ask name of opponent X
  - check if in db
    - if not end tell user and conversation

#### /enter
- update userId in db (user could have changed his username)
- TODO delete old usernames
- check if there is an entry in userRequests with key = userId
- if not reply saying noone requested to play with user
- else set value to true
- if all values in the hash are true the game can start
- create a new game in DB
- send to all users the initial status of the game

## Strutture Redis 

- HASH users to store [username,userID]
```
usernameA: 123456
usernameB: 654321
usernameC: 000111
usernameD: 222333
```
- HASH userRequests to store [username,groupID]
```
654321: 1
```
- a HASH acceptsX for each pending game 
```
usernameA: true
usernameB: false
```
BITMAP pendingIdUsed to know the free id of the pending and not waste space
```
1
```
- HASH usersActiveGroup to store [username,groupID]
```
123456: 1
654321: 1
```
a LIST groupId for each group to store userId in group
```
1 [123456, 654321]
4 [000111, 222333]
```
BITMAP groupIdUsed to know the free id of the group and not waste space
```
1 0 0 1
```

Game data
- 1.gameDeck LIST
- 1.activeUser STRING
- 1.hands.123456 LIST
- 1.isBussing BITMAP
- 1.board SET
- 1.bonusPoints.123456
- 1.mattaValueSTRING
- 1.strongDeck.123456 SET
- 1.weakDeck.123456 SET 
- 1.lastWhoTook

## Handlers comandi

## Handlers per messaggi utente

## Scene


# Italiano
#### /start
 - controllare che l'utente abbia uno username
- in caso positivo aggiornare 
- in caso negativo rispondere di impostare lo username e reinviare /start
