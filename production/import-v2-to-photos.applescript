-- Import the two finished V2 movies into Photos on the target Mac.
-- Usage: osascript import-v2-to-photos.applescript /absolute/delivery/folder
-- Re-running checks the dedicated album before importing. No existing media
-- are deleted, and Photos duplicate checking stays enabled.
on run argv
    if (count of argv) is not 1 then error "Supply the folder containing both V2 MP4 files."
    set deliveryFolder to item 1 of argv
    set albumTitle to "OfficeAdmin + AIVA - V2"
    set fileNames to {"OfficeAdmin_AIVA_V2_Film.mp4", "OfficeAdmin_AIVA_V2_Vertical.mp4"}
    set mediaTitles to {"OfficeAdmin + AIVA - Widescreen (V2)", "OfficeAdmin + AIVA - Vertical (V2)"}
    set expectedWidths to {1920, 1080}
    set expectedHeights to {1080, 1920}
    set importFiles to {}
    -- Resolve both files before making any change to Photos.
    repeat with fileName in fileNames
        set end of importFiles to (POSIX file (deliveryFolder & "/" & (fileName as text))) as alias
    end repeat
    set receipt to "ALBUM" & tab & albumTitle & linefeed
    with timeout of 300 seconds
        tell application "Photos"
            launch
            set foundAlbums to every album whose name is albumTitle
            if (count of foundAlbums) > 1 then error "Multiple V2 albums exist. Review them before importing."
            if (count of foundAlbums) is 0 then
                set targetAlbum to make new album named albumTitle
            else
                set targetAlbum to item 1 of foundAlbums
            end if
            repeat with i from 1 to 2
                set expectedFile to item i of fileNames
                set matches to (every media item of targetAlbum whose filename is expectedFile)
                if (count of matches) is 0 then
                    set sourceFile to item i of importFiles
                    import {sourceFile} into targetAlbum skip check duplicates false
                    set matches to (every media item of targetAlbum whose filename is expectedFile)
                end if
                if (count of matches) is not 1 then error "Cannot uniquely verify the imported file: " & expectedFile
                set importedMovie to item 1 of matches
                if (width of importedMovie) is not (item i of expectedWidths) then error "Imported movie width does not match: " & expectedFile
                if (height of importedMovie) is not (item i of expectedHeights) then error "Imported movie height does not match: " & expectedFile
                set name of importedMovie to item i of mediaTitles
                set description of importedMovie to "96-second OfficeAdmin + AIVA product film, version 2. Actual app interface with fictional demo data."
                set receipt to receipt & expectedFile & tab & (id of importedMovie) & tab & ((width of importedMovie) as text) & "x" & ((height of importedMovie) as text) & linefeed
            end repeat
        end tell
    end timeout
    return receipt
end run
