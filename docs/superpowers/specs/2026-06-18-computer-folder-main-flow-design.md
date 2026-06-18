# Computer Folder Main Flow Design

## Goal

Make the mini program behave like a NAS file browser. The primary flow should start from computers, then folders, then actions. Uploading and browsing must happen inside a selected computer and selected folder.

## Main Flow

```text
Computer list
  -> online computer
    -> folder browser
      -> selected folder
        -> upload media
        -> view media in this folder
        -> preview media
```

## Pages

- Computer list page: first screen. Shows saved computers, persists them locally, and refreshes online/offline status.
- Add computer page: form for computer name and LAN address.
- Computer folders page: shows folders for a selected computer and path.
- Folder actions page: selected computer + folder context. Supports upload and media list for that folder.
- Media detail page: previews a selected media file.

## API Changes

The desktop agent already accepts `targetFolder` on upload. It now also needs folder-scoped listing:

```text
GET /media?folder=/Photos
```

The response includes records whose relative path starts with the selected folder. The root folder `/` returns all media.

## UX Rules

- Offline computers remain visible but cannot be opened.
- Upload is only available after selecting a computer and folder.
- Library listing in this flow is folder-scoped.
- Saved computers remain in local storage.

