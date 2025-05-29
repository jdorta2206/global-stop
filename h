[33mcommit 34fceb7d88fea08ebec10d2a00c7e9cd626cce13[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmaster[m[33m)[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Sun May 25 01:15:57 2025 +0000

    Simplify Genkit init to rely on GOOGLE_GENERATIVE_AI_API_KEY and remove setupGoogleCredentials

[33mcommit 7e718764a53a5c61bb0cd9e23ff1f4f508d7d99c[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Sun May 25 00:52:30 2025 +0000

    Corrected genkit init file and added imports in functions

[33mcommit e0ac1e394bd875a89587f8cc54e70f20ad0e4d91[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Sun May 25 00:38:06 2025 +0000

    Fix Genkit initialization and add logging for Netlify credentials

[33mcommit 7050212bb355687765cce39f0f79ec1b98fd2417[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Sun May 25 00:25:20 2025 +0000

    Fix Genkit initialization and add logging for Netlify credentials

[33mcommit 0cbe57a468aa31706bcdc3b5ddacd0945434fc74[m[33m ([m[1;31morigin/master[m[33m)[m
Merge: d08e38c 5df8900
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Fri May 23 23:32:31 2025 +0000

    Merge branch 'master' of https://github.com/jdorta2206/global-stop

[33mcommit d08e38c3b731c05eeabd09631a7922700d86ac46[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Fri May 23 09:45:28 2025 +0000

    Add all project files and update existing

[33mcommit a33f08f7385dd4f280c64498fec33a4385e15e57[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 16:09:04 2025 +0000

    ERROR: failed to build: exit status 1
    ERROR: failed to build: executing lifecycle: failed with status code: 51
    Finished Step #3 - "pack"
    ERROR
    ERROR: build step 3 "gcr.io/k8s-skaffold/pack" failed: step exited with non-zero status: 1

[33mcommit fba3228e72f497d9db930e845a19dda85baad7e9[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 15:38:08 2025 +0000

    Error: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD

[33mcommit c2a45292342242cda4cc10c180f854f6fdb7a875[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 14:33:10 2025 +0000

    pero al enviarle la invitacion a sala no les deja unirse

[33mcommit 16c99b5601ab22bebd0426a71c5b216e0489d2a4[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 14:19:41 2025 +0000

    como puedo poner mi logo hay arriva en la ventana

[33mcommit 234c8e57ae91260e4116194f3ad220ed3339c8e6[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 10:23:54 2025 +0000

    no me deja aceder a una cuenta se de google o de facebbok

[33mcommit 15b569baae7593f75ef66e6731cc8e015cee3888[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 10:20:35 2025 +0000

    lo eh cambiado y eh puesto uno mas corto

[33mcommit fb65f8e55de1f2b0236e528b185a5ddffc0723e4[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 10:06:54 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Console Error: [GamePage] Error loading home screen audio: /music/home-screen-music.mp3. Check file path in public/music/ folder.. Error source: src/app/page.tsx (226:19) @ GamePage.useEffect
    >
    >   224 |         homeScreenAudioRef.current.loop = true;
    >   225 |         homeScreenAudioRef.current.onerror = () => {
    > > 226 |           console.error("[GamePage] Error loading home screen audio: /music/home-screen-music.mp3. Check file path in public/music/ folder.");
    >       |                   ^
    >   227 |         };
    >   228 |       }
    >   229 |       if (!backgroundAudioRef.current) {
    >
    > Call Stack
    > 4
    >
    > Show 3 ignore-listed frame(s)
    > GamePage.useEffect
    > src/app/page.tsx (226:19)

[33mcommit 9aca680741023891c239ef72c151d36aacf78bf2[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 09:59:25 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Unhandled Runtime Error: Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.. Error source: src/components/ui/select.tsx (19:3) @ _c
    >
    >   17 |   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
    >   18 | >(({ className, children, ...props }, ref) => (
    > > 19 |   <SelectPrimitive.Trigger
    >      |   ^
    >   20 |     ref={ref}
    >   21 |     className={cn(
    >   22 |       "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
    >
    > Call Stack
    > 61
    >
    > Show 55 ignore-listed frame(s)
    > Array.map
    > <anonymous> (0:0)
    > Array.map
    > <anonymous> (0:0)
    > button
    > <anonymous> (0:0)
    > _c
    > src/components/ui/select.tsx (19:3)
    > AppHeader
    > src/components/layout/header.tsx (42:13)
    > RoomPage
    > src/app/room/[roomId]/page.tsx (710:9)

[33mcommit 3e61c4b8b2986377d5ae7abde967d56f83bd11a7[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 09:56:47 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Unhandled Runtime Error: Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.. Error source: src/components/ui/select.tsx (19:3) @ _c
    >
    >   17 |   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
    >   18 | >(({ className, children, ...props }, ref) => (
    > > 19 |   <SelectPrimitive.Trigger
    >      |   ^
    >   20 |     ref={ref}
    >   21 |     className={cn(
    >   22 |       "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
    >
    > Call Stack
    > 61
    >
    > Show 55 ignore-listed frame(s)
    > Array.map
    > <anonymous> (0:0)
    > Array.map
    > <anonymous> (0:0)
    > button
    > <anonymous> (0:0)
    > _c
    > src/components/ui/select.tsx (19:3)
    > AppHeader
    > src/components/layout/header.tsx (41:13)
    > RoomPage
    > src/app/room/[roomId]/page.tsx (710:9)

[33mcommit e4371543541fcbcb629da5bd0764029c13880832[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 09:49:54 2025 +0000

    pon esta cancion https://soundcloud.com/redmusices/musica-sin-copyright-8-bit-base-de-hip-hop-musica-de-fondo-para-gaming-stream-y-mas?si=de9f5f25581e459a8f74f37e36521e5c&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing en la pantalla de inicio

[33mcommit a6a445cdb6e61e2ee171a2dd03461139c431d332[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 09:31:45 2025 +0000

    remplaca esta cancion 2019-12-11_-_Retro_Platforming_-_David_Fesliyan.mp3 por the-ticking-of-the-mantel-clock.mp3

[33mcommit c8e19eeb5537b25ed1deba8457a8349106e664f8[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 09:18:38 2025 +0000

    pon este sonido dry-cuckoo-sound.mp3 cuando se pulse el boton stop o cuando se acave la cuenta atras

[33mcommit 2b8583266ba4d512f59ed3cc808b343cfd9c2c3d[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 06:49:16 2025 +0000

    quiero que pongas esta musica the-ticking-of-the-mantel-clock.mp3 cada vez que se juege

[33mcommit 779f6a9a5c11263829b5dcd42b37a7ea7b8b192f[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Wed May 21 06:35:12 2025 +0000

    Error: ./src/app/page.tsx:80:2
    Parsing ecmascript source code failed
      78 | const MOCK_PLAYERS_IN_LOBBY: Omit<PlayerInLobby, 'isCurrentUser' | 'isOnline'>[] = [
      79 |   { id: 'player2', name: 'Amigo Carlos', avatar: `https://placehold.co/40x40.png?text=C` },
    > 80 |  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false);
         |  ^^^^^
      81 |  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false);
      82 |  const [generatedRoomId, setGeneratedRoomId] = useState<string | null>(null);
      83 |  const [showJoinRoomDialog, setShowJoinRoomDialog] = useState(false);
    
    Expression expected
    
        at <unknown> (Error: ./src/app/page.tsx:80:2)
        at Object.getCompilationErrors (file:///home/user/studio/node_modules/next/dist/server/dev/hot-reloader-turbopack.js:722:59)
        at DevBundlerService.getCompilationError (file:///home/user/studio/node_modules/next/dist/server/lib/dev-bundler-service.js:39:55)
        at DevServer.getCompilationError (file:///home/user/studio/node_modules/next/dist/server/dev/next-dev-server.js:643:42)
        at DevServer.findPageComponents (file:///home/user/studio/node_modules/next/dist/server/dev/next-dev-server.js:613:43)
        at async DevServer.renderErrorToResponseImpl (file:///home/user/studio/node_modules/next/dist/server/base-server.js:2604:26)

[33mcommit cbc43db5ce8962172f68c6413e9b1a0804dae972[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 13:45:53 2025 +0000

    cambia la musica y pon 2019-12-11_-_Retro_Platforming_-_David_Fesliyan.mp3

[33mcommit bd04c22f4027a05019538563096b295e96e0f52d[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 12:51:54 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > ./src/components/game/stop-button.tsx:35:6
    > Parsing ecmascript source code failed
    >   33 |
    >   34 |   return (
    > > 35 |     <Button
    >      |      ^^^^^^
    >   36 |       onClick={onClick}
    >   37 |       disabled={disabled}
    >   38 |       variant="default" // Base variant, we override colors
    >
    > Unexpected token `Button`. Expected jsx identifier
    >
    >

[33mcommit 534eb72a4588317115d4a20844ae01c7da2ebc2a[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 12:43:40 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > ./src/components/game/stop-button.tsx:35:6
    > Parsing ecmascript source code failed
    >   33 |
    >   34 |   return (
    > > 35 |     <ShadButton // Using the aliased import
    >      |      ^^^^^^^^^^
    >   36 |       onClick={onClick}
    >   37 |       disabled={disabled}
    >   38 |       variant="default" // Base variant, we override colors
    >
    > Unexpected token `ShadButton`. Expected jsx identifier
    >
    >

[33mcommit 1be1b319dc536367c033024361b59673947f150c[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 12:39:58 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > ./src/components/game/stop-button.tsx:29:6
    > Parsing ecmascript source code failed
    >   27 |
    >   28 |   return (
    > > 29 |     <Button
    >      |      ^^^^^^
    >   30 |       onClick={onClick}
    >   31 |       disabled={disabled}
    >   32 |       variant="default" // Base variant, we override colors
    >
    > Unexpected token `Button`. Expected jsx identifier
    >
    >

[33mcommit 1af72446cd77144b6afa498c09c27e501a708065[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 11:56:49 2025 +0000

    > nextn@0.1.0 build
    > tsc --noEmit && next build
    
    src/app/room/[roomId]/page.tsx:355:34 - error TS2352: Conversion of type 'Record<Language, string>' to type '"title" | "idCopiedToastTitle" | "joinHere" | "chatLoginMessage" | "leaveRoomButton" | "timeLeftLabel" | "copyRoomLinkButton" | "playerListTitle" | "addFriendButton" | "onlineStatus" | ... 45 more ... | "playerHasNotSubmitted"' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
    
    355         toast({ title: translate(UI_TEXTS.errorToastTitle as keyof typeof ROOM_TEXTS), description: "No se pudieron cargar los mensajes.", variant: "destructive"});
                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    src/app/room/[roomId]/page.tsx:411:33 - error TS2352: Conversion of type 'Record<Language, string>' to type '"title" | "idCopiedToastTitle" | "joinHere" | "chatLoginMessage" | "leaveRoomButton" | "timeLeftLabel" | "copyRoomLinkButton" | "playerListTitle" | "addFriendButton" | "onlineStatus" | ... 45 more ... | "playerHasNotSubmitted"' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
    
    411         toast({title: translate(UI_TEXTS.errorToastTitle as keyof typeof ROOM_TEXTS), description: "No se pudieron enviar tus respuestas.", variant: "destructive"});
                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    src/app/room/[roomId]/page.tsx:699:38 - error TS2352: Conversion of type 'Record<Language, string>' to type 'string' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
    
    699       toast({ title: commonTranslate(UI_TEXTS.chatLoginTitle as keyof typeof UI_TEXTS), description: commonTranslate(UI_TEXTS.chatLoginMessage as keyof typeof UI_TEXTS), variant: "destructive" });
                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    src/app/room/[roomId]/page.tsx:699:118 - error TS2352: Conversion of type 'Record<Language, string>' to type 'string' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
    
    699       toast({ title: commonTranslate(UI_TEXTS.chatLoginTitle as keyof typeof UI_TEXTS), description: commonTranslate(UI_TEXTS.chatLoginMessage as keyof typeof UI_TEXTS), variant: "destructive" });
                                                                                                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    src/app/room/[roomId]/page.tsx:716:32 - error TS2352: Conversion of type 'Record<Language, string>' to type '"title" | "idCopiedToastTitle" | "joinHere" | "chatLoginMessage" | "leaveRoomButton" | "timeLeftLabel" | "copyRoomLinkButton" | "playerListTitle" | "addFriendButton" | "onlineStatus" | ... 45 more ... | "playerHasNotSubmitted"' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
    
    716       toast({ title: translate(UI_TEXTS.errorToastTitle as keyof typeof ROOM_TEXTS), description: "No se pudo enviar tu mensaje.", variant: "destructive" });
                                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    Found 5 errors in the same file, starting at: src/app/room/[roomId]/page.tsx:355

[33mcommit 0dffb52c617cc66a50b4ddd90cd7d639b98afe56[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 11:50:51 2025 +0000

    > nextn@0.1.0 build
    > tsc --noEmit && next build
    
    src/app/page.tsx:1130:11 - error TS2322: Type '{ messages: ChatMessage[]; onSendMessage: (text: string) => void; isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>>; currentUserUid: string | undefined; currentUserName: string; currentUserAvatar: string | ... 1 more ... | undefined; language: Language; currentRoomId: null; }' is not assignable to type 'IntrinsicAttributes & ChatPanelProps'.
      Property 'currentRoomId' does not exist on type 'IntrinsicAttributes & ChatPanelProps'.
    
    1130           currentRoomId={null} // This chat panel on main page is not tied to a DB room
                   ~~~~~~~~~~~~~
    
    src/app/room/[roomId]/page.tsx:983:11 - error TS2322: Type '{ messages: ChatMessage[]; onSendMessageDB: (text: string) => void; isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>>; currentUserUid: string; currentUserName: string; currentUserAvatar: string | null; language: Language; currentRoomId: string; }' is not assignable to type 'IntrinsicAttributes & ChatPanelProps'.
      Property 'onSendMessageDB' does not exist on type 'IntrinsicAttributes & ChatPanelProps'. Did you mean 'onSendMessage'?
    
    983           onSendMessageDB={handleSendChatMessageInRoom} // Use DB sending if in a room
                  ~~~~~~~~~~~~~~~
    
    Found 2 errors in 2 files.
    
    Errors  Files
         1  src/app/page.tsx:1130

[33mcommit 570d27a6199f0ab31af2bd601b212a67e7aa1c4d[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 11:43:56 2025 +0000

    Something went wrong in the build or rollout process. Look at the logs to see more details.

[33mcommit ff4995d04ff1595e11cde0620562d682e6eedfb1[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 10:42:04 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Unhandled Runtime Error: Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
    > 1. You might have mismatching versions of React and the renderer (such as React DOM)
    > 2. You might be breaking the Rules of Hooks
    > 3. You might have more than one copy of React in the same app
    > See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.. Error source: src/app/room/[roomId]/page.tsx (337:13) @ RoomPage.useEffect
    >
    >   335 |     const currentRoundIdForEffect = gameData?.currentRoundId; // Use a stable variable for dependency
    >   336 |
    > > 337 |     useEffect(() => { // Separate useEffect for roundEvaluation listener
    >       |             ^
    >   338 |       let unsubscribeRoundEval: (() => void) | null = null;
    >   339 |       if (currentRoundIdForEffect) {
    >   340 |         const roundEvaluationRefPath = `rooms/${roomIdFromParams}/roundsData/${currentRoundIdForEffect}/evaluation`;
    >
    > Call Stack
    > 4
    >
    > Show 3 ignore-listed frame(s)
    > RoomPage.useEffect
    > src/app/room/[roomId]/page.tsx (337:13)

[33mcommit 0867c1183875a885949074f494829d4e503c06d3[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 10:37:31 2025 +0000

    Application error: a client-side exception has occurred while loading studio--global-stop.us-central1.hosted.app (see the browser console for more information).

[33mcommit 2b6488c6b49537e9a64768da45b362f173395bbc[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 10:30:15 2025 +0000

    vamos a terinar con lo de la sala con amigos para que funcione al 100%

[33mcommit 9fb3b44c9be4839223c966139f48a57d3d88bcd7[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 09:59:13 2025 +0000

    cambia 2019-12-11_-_Retro_Platforming_-_David_Fesliyan.mp3 como fondo del juego

[33mcommit 73a198d6069104a30ae1f820665173dd76790e3e[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 09:48:46 2025 +0000

    pon T Bless - Korobeiniki - 8-Bit Version.mp3 como musica de fondo

[33mcommit 3d6ea7e41f0cd1ab6821228dc405d703b7e1e910[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 08:50:31 2025 +0000

    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
       ▲ Next.js 15.2.3 (Turbopack)
       - Local:        http://localhost:9003
       - Network:      http://10.88.0.3:9003
       - Environments: .env
    
     ✓ Starting...
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
     ✓ Ready in 11.6s
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
     ○ Compiling / ...
     ✓ Compiled / in 43s
    [Genkit Init] Attempting to initialize Genkit with Google AI. Ensure GOOGLE_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) is set correctly in your server environment.
     ⚠ Unsupported metadata themeColor is configured in metadata export in /. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET / 200 in 46546ms
     ⚠ Blocked cross-origin request from 9003-firebase-studio-1747394567673.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev. To allow this, configure "allowedDevOrigins" in next.config
    Read more: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
     ○ Compiling /_not-found/page ...
     ✓ Compiled /_not-found/page in 4.7s
     ⚠ Unsupported metadata themeColor is configured in metadata export in /music/countdown_urgent.mp3. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /music/countdown_urgent.mp3 404 in 3693ms
     ⚠ Unsupported metadata themeColor is configured in metadata export in /music/tension-music.mp3. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     ⚠ Unsupported metadata themeColor is configured in metadata export in /logo_stop_game.png. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     ⚠ Unsupported metadata themeColor is configured in metadata export in /logo_stop_game.png. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /music/tension-music.mp3 404 in 4011ms
     GET /logo_stop_game.png 404 in 5395ms
     ⨯ The requested resource isn't a valid image for /logo_stop_game.png received text/html; charset=utf-8
     GET /logo_stop_game.png 404 in 5295ms
     ⨯ The requested resource isn't a valid image for /logo_stop_game.png received text/html; charset=utf-8
    npm run dev
     ⚠ Unsupported metadata themeColor is configured in metadata export in /. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET / 200 in 3584ms
     ⚠ Unsupported metadata themeColor is configured in metadata export in /logo_stop_game.png. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /logo_stop_game.png 404 in 2671ms
     ⨯ The requested resource isn't a valid image for /logo_stop_game.png received text/html; charset=utf-8
     ⚠ Unsupported metadata themeColor is configured in metadata export in /logo_stop_game.png. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /logo_stop_game.png 404 in 3368ms
     ⨯ The requested resource isn't a valid image for /logo_stop_game.png received text/html; charset=utf-8
     ⚠ Unsupported metadata themeColor is configured in metadata export in /music/countdown_urgent.mp3. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /music/countdown_urgent.mp3 404 in 960ms
     ⚠ Unsupported metadata themeColor is configured in metadata export in /music/tension-music.mp3. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /music/tension-music.mp3 404 in 1786ms
     ⚠ Found a change in next.config.ts. Restarting the server to apply the changes...
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
       ▲ Next.js 15.2.3 (Turbopack)
       - Local:        http://localhost:9003
       - Network:      http://10.88.0.3:9003
       - Environments: .env
       - Experiments (use with caution):
         · allowedDevOrigins
    
     ✓ Starting...
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
     ✓ Ready in 5.6s
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
    npm run dev
     ○ Compiling / ...
     ✓ Compiled / in 55.6s
    [Genkit Init] Attempting to initialize Genkit with Google AI. Ensure GOOGLE_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) is set correctly in your server environment.
     GET / 200 in 59830ms
     ⚠ Blocked cross-origin request from 9003-firebase-studio-1747394567673.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev. To allow this, configure "allowedDevOrigins" in next.config
    Read more: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
     ○ Compiling /_not-found/page ...
     ✓ Compiled /_not-found/page in 4.9s
     GET /logo_stop_game.png 404 in 5230ms
     ⨯ The requested resource isn't a valid image for /logo_stop_game.png received text/html; charset=utf-8
     GET /music/tension-music.mp3 404 in 4085ms
     GET /logo_stop_game.png 404 in 5538ms
     ⨯ The requested resource isn't a valid image for /logo_stop_game.png received text/html; charset=utf-8
     GET /music/countdown_urgent.mp3 404 in 4142ms
    ^CShutting down all Genkit servers...

[33mcommit d00923874010dddb21914cf9f1b11d43b3814ad0[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 06:44:24 2025 +0000

    > nextn@0.1.0 dev
    > next dev --turbopack -p 9003
    
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
       ▲ Next.js 15.2.3 (Turbopack)
       - Local:        http://localhost:9003
       - Network:      http://10.88.0.3:9003
       - Environments: .env
    
     ✓ Starting...
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
     ✓ Ready in 11.6s
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
     ○ Compiling / ...
     ✓ Compiled / in 43s
    [Genkit Init] Attempting to initialize Genkit with Google AI. Ensure GOOGLE_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) is set correctly in your server environment.
     ⚠ Unsupported metadata themeColor is configured in metadata export in /. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET / 200 in 46546ms
     ⚠ Blocked cross-origin request from 9003-firebase-studio-1747394567673.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev. To allow this, configure "allowedDevOrigins" in next.config
    Read more: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
     ○ Compiling /_not-found/page ...
     ✓ Compiled /_not-found/page in 4.7s
     ⚠ Unsupported metadata themeColor is configured in metadata export in /music/countdown_urgent.mp3. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /music/countdown_urgent.mp3 404 in 3693ms
     ⚠ Unsupported metadata themeColor is configured in metadata export in /music/tension-music.mp3. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     ⚠ Unsupported metadata themeColor is configured in metadata export in /logo_stop_game.png. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     ⚠ Unsupported metadata themeColor is configured in metadata export in /logo_stop_game.png. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /music/tension-music.mp3 404 in 4011ms
     GET /logo_stop_game.png 404 in 5395ms
     ⨯ The requested resource isn't a valid image for /logo_stop_game.png received text/html; charset=utf-8
     GET /logo_stop_game.png 404 in 5295ms
     ⨯ The requested resource isn't a valid image for /logo_stop_game.png received text/html; charset=utf-8
    npm run dev
     ⚠ Unsupported metadata themeColor is configured in metadata export in /. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET / 200 in 3584ms
     ⚠ Unsupported metadata themeColor is configured in metadata export in /logo_stop_game.png. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /logo_stop_game.png 404 in 2671ms
     ⨯ The requested resource isn't a valid image for /logo_stop_game.png received text/html; charset=utf-8
     ⚠ Unsupported metadata themeColor is configured in metadata export in /logo_stop_game.png. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /logo_stop_game.png 404 in 3368ms
     ⨯ The requested resource isn't a valid image for /logo_stop_game.png received text/html; charset=utf-8
     ⚠ Unsupported metadata themeColor is configured in metadata export in /music/countdown_urgent.mp3. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /music/countdown_urgent.mp3 404 in 960ms
     ⚠ Unsupported metadata themeColor is configured in metadata export in /music/tension-music.mp3. Please move it to viewport export instead.
    Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
     GET /music/tension-music.mp3 404 in 1786ms

[33mcommit 4c147753adb13b4a45f1f5c13835b50cb94c40d4[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 00:22:47 2025 +0000

    > nextn@0.1.0 dev
    > next dev --turbopack -p 9002
    
    --- next.config.js execution start ---
    Current NODE_ENV: development
    Effective ignoreBuildErrors (TypeScript): false
    Effective ignoreDuringBuilds (ESLint): false
    --- next.config.js execution end ---
     ⨯ Failed to start server
    Error: listen EADDRINUSE: address already in use :::9002
        at <unknown> (Error: listen EADDRINUSE: address already in use :::9002)
        at new Promise (<anonymous>) {
      code: 'EADDRINUSE',
      errno: -98,
      syscall: 'listen',
      address: '::',
      port: 9002
    }

[33mcommit b259c7e4bca7a90b0c9d8507589201837026d705[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 00:13:14 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Internal Server Error

[33mcommit 556a6dee47278af91fa99c0166c4cd53ebfa8e89[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 00:07:50 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Internal Server Error

[33mcommit bc685dd14d1b89ce9f868d60fa8a499c07c01089[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 00:06:31 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Internal Server Error

[33mcommit 2907d5ba0739da30b97acc9769575450b3faa4ce[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Tue May 20 00:02:36 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Internal Server Error

[33mcommit 5ae96abe41943f2f9b664fab7ab744a59416906d[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 23:35:10 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Internal Server Error

[33mcommit 42cb8fefe6f11ee9e252f84d8529bdd26ebe46bd[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 23:12:38 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Internal Server Error

[33mcommit 4f04a25cdae3a642f8dde84619a824f290df7919[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 22:45:30 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Internal Server Error

[33mcommit 0ef6bf85cee714e2de3cda8ac13abd0e24d9ab83[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 22:32:56 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Internal Server Error

[33mcommit 2a7c21d0c3a6c0cd499bd2e7cf167dbe24a46748[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 22:25:10 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Internal Server Error

[33mcommit 9512bd3f642cd8da282da989cde5bf1e9bd0bc78[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 22:16:18 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Internal Server Error

[33mcommit 4e8358566aaea681d5cc2d5a2c1717b12ba0f025[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 21:49:36 2025 +0000

    solucioname esto Se produjo un error durante el proceso de compilación o implementación. Consulta los registros para obtener más información.

[33mcommit 819709fae321269210a137e2c22af0b4a95cb88f[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 21:43:06 2025 +0000

    Las capturas de pantalla deben ser una matriz de objetos de captura de pantalla

[33mcommit d47877514d0e9f5c241aa56a5ce674768e09951f[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 21:42:18 2025 +0000

    La orientación debe ser una de las siguientes cadenas: cualquiera, natural, paisaje, paisaje-primario, paisaje-secundario, retrato, retrato-primario, retrato-secundario

[33mcommit 699f25b1b2293c83e9e4b3413b76fba582784b8f[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 21:26:00 2025 +0000

    solucioname esto Se necesitan íconos separados tanto para los enmascarables como para los que se pueden usar en cualquier momento.

[33mcommit 695d9f4ddbeec782ad288d7862d43142d0615648[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 21:19:08 2025 +0000

    combierto en aplicacion android

[33mcommit 4f7281bdaa13cd830709b2bf5b79699f1f984685[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 21:05:43 2025 +0000

    pon este como logo principal

[33mcommit 34a9c51d028da77003b16f99e978cc5225f1ad13[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 20:58:10 2025 +0000

    como solucionar el probla de los iconos no se ven

[33mcommit 62e920add547a8a8543443ccb7b14f3ac76ab5ef[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 16:48:50 2025 +0000

    Por qué no se ve el logo

[33mcommit 2ecaa80152ac7c4c5cb6fcfe57753a8abfc83416[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 16:39:07 2025 +0000

    Pon el logo en el medio debajo de las letras elige lo que quieres jugar

[33mcommit 778a3e8eeb9f284302ba9fb66c1daf1c4422cd09[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 14:31:05 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > Unhandled Runtime Error: Error: Event handlers cannot be passed to Client Component props.
    >   <... id="fb-sdk" src=... strategy=... onLoad={function onLoad}>
    >                                                ^^^^^^^^^^^^^^^^^
    > If you need interactivity, consider converting part of this to a Client Component.. Error source: Call Stack
    > 4
    >
    > Show 4 ignore-listed frame(s)

[33mcommit fcd2dda96ec6ad6ff89278ec75f31b055852944d[m
Author: Jaime Dorta <jdorta2206@gmail.com>
Date:   Mon May 19 14:26:18 2025 +0000

    I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).
    
    A > before the line number in the error source usually indicates the line of interest:
    
    > <!DOCTYPE html><html id="__next_error__"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/%5Bturbopack%5D_browser_dev_hmr-client_hmr-client_ts_49a6ea35._.js"/><script src="/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js" async=""></script><script src="/_next/static/chunks/node_modules_next_dist_client_43e3ffb8._.js" async=""></script><script src="/_next/static/chunks/node_modules_next_dist_3bfaed20._.js" async=""></script><script src="/_next/static/chunks/node_modules_%40swc_helpers_cjs_00636ac3._.js" async=""></script><script src="/_next/static/chunks/_e69f0d32._.js" async=""></script><script src="/_next/static/chunks/_be317ff2._.js" async=""></script><script src="/_next/static/chunks/node_modules_next_dist_1a6ee436._.js" async=""></script><script src="/_next/static/chunks/src_app_favicon_ico_mjs_79b6a596._.js" async=""></script><meta name="robots" content="noindex"/><meta name="next-size-adjust" content=""/><meta name="next-error" content="not-found"/><meta name="theme-color" content="#C0474A"/><!--$--><!--/$--><script src="/_next/static/chunks/node_modules_next_dist_build_polyfills_polyfill-nomodule.js" noModule=""></script></head><body><script src="/_next/static/chunks/%5Bturbopack%5D_browser_dev_hmr-client_hmr-client_ts_49a6ea35._.js" async=""></script><script>(self.__next_f=self.__next_f||[]).push([0])</script><script>self.__next_f.push([1,"3:\"$Sreact.fragment\"\n5:I[\"[project]/node_modules/next/dist/client/components/layout-router.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/src_app_favicon_ico_mjs_79b6a596._.js\"],\"default\"]\n6:I[\"[project]/node_modules/next/dist/client/components/render-from-template-context.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/src_app_favicon_ico_mjs_79b6a596._.js\"],\"default\"]\n8:I[\"[project]/src/contexts/language-context.tsx [app-client] (ecmascript)\",[\"static/chunks/node_modules_8b046844._.js\",\"static/chunks/src_06d1d02f._.js\",\"static/chunks/src_app_layout_tsx_f0e4c1a2._.js\"],\"LanguageProvider\"]\n9:I[\"[project]/src/contexts/auth-context.tsx [app-client] (ecmascript)\",[\"static/chunks/node_modules_8b046844._.js\",\"static/chunks/src_06d1d02f._.js\",\"static/chunks/src_app_layout_tsx_f0e4c1a2._.js\"],\"AuthProvider\"]\na:I[\"[project]/src/contexts/room-context.tsx [app-client] (ecmascript)\",[\"static/chunks/node_modules_8b046844._.js\",\"static/chunks/src_06d1d02f._.js\",\"static/chunks/src_app_layout_tsx_f0e4c1a2._.js\"],\"RoomProvider\"]\ne:I[\"[project]/src/components/ui/toaster.tsx [app-client] (ecmascript)\",[\"static/chunks/node_modules_8b046844._.js\",\"static/chunks/src_06d1d02f._.js\",\"static/chunks/src_app_layout_tsx_f0e4c1a2._.js\"],\"Toaster\"]\nf:I[\"[project]/node_modules/next/dist/client/script.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_8b046844._.js\",\"static/chunks/src_06d1d02f._.js\",\"static/chunks/src_app_layout_tsx_f0e4c1a2._.js\"],\"\"]\n11:I[\"[project]/node_modules/next/dist/client/components/client-page.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/src_app_favicon_ico_mjs_79b6a596._.js\"],\"ClientPageRoot\"]\n12:I[\"[project]/src/app/page.tsx [app-client] (ecmascript)\",[\"static/chunks/node_modules_8b046844._.js\",\"static/chunks/src_06d1d02f._.js\",\"static/chunks/src_app_layout_tsx_f0e4c1a2._.js\",\"static/chunks/[turbopack]_browser_dev_hmr-client_hmr-client_ts_bee89ff4._.js\""])</script><script>self.__next_f.push([1,",\"static/chunks/src_d893e819._.js\",\"static/chunks/node_modules_f1d073df._.js\",\"static/chunks/src_app_page_tsx_1f2b3397._.js\"],\"default\"]\n16:I[\"[project]/node_modules/next/dist/client/components/metadata/metadata-boundary.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/src_app_favicon_ico_mjs_79b6a596._.js\"],\"MetadataBoundary\"]\n19:I[\"[project]/node_modules/next/dist/client/components/metadata/metadata-boundary.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/src_app_favicon_ico_mjs_79b6a596._.js\"],\"OutletBoundary\"]\n20:I[\"[project]/node_modules/next/dist/client/components/metadata/async-metadata.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/src_app_favicon_ico_mjs_79b6a596._.js\"],\"AsyncMetadataOutlet\"]\n23:I[\"[project]/node_modules/next/dist/client/components/client-segment.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/src_app_favicon_ico_mjs_79b6a596._.js\"],\"ClientSegmentRoot\"]\n24:I[\"[project]/node_modules/next/dist/client/components/error-boundary.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/src_app_favicon_ico_mjs_79b6a596._.js\"],\"default\"]\n25:I[\"[project]/node_modules/next/dist/client/components/http-access-fallback/error-boundary.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/src_app_favicon_ico_mjs_79b6a596._.js\"],\"HTTPAccessFallbackBoundary\"]\n26:I[\"[project]/node_modules/next/dist/client/components/metadata/metadata-boundary.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/src_app_favicon_ico_mjs_79b6a596._.js\"],\"ViewportBoundary\"]\n27:\"$SkResourceStore\"\n30:\"$Sreact.suspense\"\n31:I[\"[project]/node_modules/next/dist/client/components/metadata/async-metadata.js [app-client] (ecmascript)\",[\"static/chunks/node_modules_next_dist_1a6ee436._.js\",\"static/chunks/s"])</script><script>self.__next_f.push([1,"rc_app_favicon_ico_mjs_79b6a596._.js\"],\"AsyncMetadata\"]\n:HL[\"/_next/static/chunks/%5Broot%20of%20the%20server%5D__b07dbc43._.css\",\"style\"]\n:HL[\"/_next/static/media/gyByhwUxId8gMEwcGFWNOITd-s.p.da1ebef7.woff2\",\"font\",{\"crossOrigin\":\"\",\"type\":\"font/woff2\"}]\n:HL[\"/_next/static/media/or3nQ6H_1_WfwkMZI_qYFrcdmhHkjko-s.p.be19f591.woff2\",\"font\",{\"crossOrigin\":\"\",\"type\":\"font/woff2\"}]\n2:{\"name\":\"Preloads\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{\"preloadCallbacks\":[\"$E(()=\u003e{ctx.componentMod.preloadStyle(fullHref,ctx.renderOpts.crossOrigin,ctx.nonce)})\",\"$E(()=\u003e{ctx.componentMod.preloadFont(href,type,ctx.renderOpts.crossOrigin,ctx.nonce)})\",\"$E(()=\u003e{ctx.componentMod.preloadFont(href,type,ctx.renderOpts.crossOrigin,ctx.nonce)})\"]}}\n1:D\"$2\"\n1:null\n7:{\"name\":\"RootLayout\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{\"children\":[\"$\",\"$L5\",null,{\"parallelRouterKey\":\"children\",\"error\":\"$undefined\",\"errorStyles\":\"$undefined\",\"errorScripts\":\"$undefined\",\"template\":[\"$\",\"$3\",null,{\"children\":[\"$\",\"$L6\",null,{},null,[],1]},null,[],0],\"templateStyles\":\"$undefined\",\"templateScripts\":\"$undefined\",\"notFound\":\"$Y\",\"forbidden\":\"$undefined\",\"unauthorized\":\"$undefined\"},null,[],1],\"params\":\"$Y\"}}\n4:D\"$7\"\nc:{\"name\":\"NotFound\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{}}\nb:D\"$c\"\nd:{\"name\":\"HTTPAccessErrorFallback\",\"env\":\"Server\",\"key\":null,\"owner\":\"$c\",\"stack\":[],\"props\":{\"status\":404,\"message\":\"This page could not be found.\"}}\nb:D\"$d\"\nb:[[\"$\",\"title\",null,{\"children\":\"404: This page could not be found.\"},\"$d\",[],1],[\"$\",\"div\",null,{\"style\":{\"fontFamily\":\"system-ui,\\\"Segoe UI\\\",Roboto,Helvetica,Arial,sans-serif,\\\"Apple Color Emoji\\\",\\\"Segoe UI Emoji\\\"\",\"height\":\"100vh\",\"textAlign\":\"center\",\"display\":\"flex\",\"flexDirection\":\"column\",\"alignItems\":\"center\",\"justifyContent\":\"center\"},\"children\":[\"$\",\"div\",null,{\"children\":[[\"$\",\"style\",null,{\"dangerouslySetInnerHTML\":{\"__html\":\"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:"])</script><script>self.__next_f.push([1,"dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}\"}},\"$d\",[],1],[\"$\",\"h1\",null,{\"className\":\"next-error-h1\",\"style\":{\"display\":\"inline-block\",\"margin\":\"0 20px 0 0\",\"padding\":\"0 23px 0 0\",\"fontSize\":24,\"fontWeight\":500,\"verticalAlign\":\"top\",\"lineHeight\":\"49px\"},\"children\":404},\"$d\",[],1],[\"$\",\"div\",null,{\"style\":{\"display\":\"inline-block\"},\"children\":[\"$\",\"h2\",null,{\"style\":{\"fontSize\":14,\"fontWeight\":400,\"lineHeight\":\"49px\",\"margin\":0},\"children\":\"This page could not be found.\"},\"$d\",[],1]},\"$d\",[],1]]},\"$d\",[],1]},\"$d\",[],1]]\n"])</script><script>self.__next_f.push([1,"4:[\"$\",\"html\",null,{\"lang\":\"es\",\"children\":[\"$\",\"body\",null,{\"className\":\"geist_e531dabc-module__QGiZLq__variable geist_mono_68a01160-module__YLcDdW__variable antialiased\",\"children\":[[\"$\",\"$L8\",null,{\"children\":[\"$\",\"$L9\",null,{\"children\":[\"$\",\"$La\",null,{\"children\":[[\"$\",\"$L5\",null,{\"parallelRouterKey\":\"children\",\"error\":\"$undefined\",\"errorStyles\":\"$undefined\",\"errorScripts\":\"$undefined\",\"template\":[\"$\",\"$L6\",null,{},null,[],1],\"templateStyles\":\"$undefined\",\"templateScripts\":\"$undefined\",\"notFound\":[\"$b\",[]],\"forbidden\":\"$undefined\",\"unauthorized\":\"$undefined\"},null,[],1],[\"$\",\"$Le\",null,{},\"$7\",[[\"RootLayout\",\"/home/user/studio/.next/server/chunks/ssr/[root of the server]__51f8d233._.js\",321,284]],1]]},\"$7\",[[\"RootLayout\",\"/home/user/studio/.next/server/chunks/ssr/[root of the server]__51f8d233._.js\",318,286]],1]},\"$7\",[[\"RootLayout\",\"/home/user/studio/.next/server/chunks/ssr/[root of the server]__51f8d233._.js\",317,282]],1]},\"$7\",[[\"RootLayout\",\"/home/user/studio/.next/server/chunks/ssr/[root of the server]__51f8d233._.js\",316,268]],1],[\"$\",\"$Lf\",null,{\"id\":\"fb-sdk-init\",\"strategy\":\"afterInteractive\",\"children\":\"\\n            window.fbAsyncInit = function() {\\n              FB.init({\\n                appId      : '{your-app-id}', // REPLACE WITH YOUR ACTUAL FACEBOOK APP ID\\n                cookie     : true,\\n                xfbml      : true,\\n                version    : 'v19.0' // REPLACE WITH YOUR DESIRED API VERSION\\n              });\\n              FB.AppEvents.logPageView();\\n            };\\n          \"},\"$7\",[[\"RootLayout\",\"/home/user/studio/.next/server/chunks/ssr/[root of the server]__51f8d233._.js\",342,268]],1],[\"$\",\"$Lf\",null,{\"id\":\"fb-sdk\",\"src\":\"https://connect.facebook.net/en_US/sdk.js\",\"strategy\":\"afterInteractive\",\"onLoad\":\"$10\"},\"$7\",[[\"RootLayout\",\"/home/user/studio/.next/server/chunks/ssr/[root of the server]__51f8d233._.js\",361,268]],1]]},\"$7\",[[\"RootLayout\",\"/home/user/studio/.next/server/chunks/ssr/[root of the server]__51f8d233._.js\",313,270]],1]},\"$7\",[[\"RootLayout\",\"/home/user/studio/.next/server/chunks/ssr/[root of the server]__51f8d233._.js\",311,263]],1]\n"])</script><script>self.__next_f.push([1,"14:{\"name\":\"\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{}}\n13:D\"$14\"\n15:{\"name\":\"MetadataTree\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{}}\n13:D\"$15\"\n18:{\"name\":\"__next_metadata_boundary__\",\"env\":\"Server\",\"key\":null,\"owner\":\"$15\",\"stack\":[],\"props\":{}}\n17:D\"$18\"\n13:[\"$\",\"$L16\",null,{\"children\":\"$L17\"},\"$15\",[],1]\n1b:{\"name\":\"__next_outlet_boundary__\",\"env\":\"Server\",\"key\":null,\"owner\":null,\"stack\":[],\"props\":{\"ready\":\"$E(async function getViewportReady() {\\n        await vi