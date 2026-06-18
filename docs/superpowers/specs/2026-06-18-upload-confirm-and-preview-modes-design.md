# Upload Confirmation And Preview Modes Design

## Goal

Improve the mini program flow so selecting media does not immediately upload it. Users should preview the selected photo/video, then explicitly confirm or cancel. The library should support small, medium, and large preview modes so photos can be recognized before opening details.

## Upload Flow

1. User taps select media.
2. The mini program shows a local preview and filename.
3. User chooses one of two actions:
   - Confirm upload: read the selected file and upload it to the desktop agent.
   - Cancel selection: clear the selected file and do not upload.
4. Upload success keeps the preview visible and shows success text.
5. Upload failure keeps the selected file visible so the user can retry.

## Library Preview Modes

The library page includes a three-option mode selector:

- Small: compact list optimized for filenames and timestamps.
- Medium: card list with a moderate image preview.
- Large: large image card for recognizing photo content directly in the library.

Photos use the desktop-agent file endpoint as their preview URL. Videos remain file cards for now and can get generated covers later.

## Scope

This change only affects the mini program app. No desktop-agent API changes are required because `GET /media/:id/file` already supports file preview streams.

