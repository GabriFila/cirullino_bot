# cirullino_bot
Un bot di telegram per giocare a cirulla con gli amici


Questo bot è scritto in JavaScript ed utilizza il framework [Telegraf.js](https://telegraf.js.org/#/). Questo framework è molto interessante ma ha una documentazione molto povera e mal strutturata. Avrei preferito scrviere il codice in TypeScript ma, anche in questo caso, il supporto lascia desiderare. Un altro componente

## Struttura
Ad alto livello il bot è composto da diversi percorsi. Ognuno iniziato da un particolare comando.

#### Comandi speciali

- [x] **/sfida** - inizio di una nuova partita
- [x] **/enter** - entrare in un gioco su invito
- [ ] **/refuse** - rifiutare l'invito a un gioco - TO DO

#### Comandi generali

- [x] **/start** - avvio del bot
- [x] **/help** - info sui comandi del bot
- [x] **/privacy** - info sulla privacyy del bot
- [x] **/about** - info sulla realizzazione del bot
- [ ] **/stop** - arresto del bot