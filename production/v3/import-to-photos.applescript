-- Import only the two completed V3 movies. Preserve existing media and duplicate checks.
on run argv
    if (count of argv) is not 1 then error "Supply the delivery folder."
    set deliveryFolder to item 1 of argv
    set albumTitle to "OfficeAdmin + AIVA - V3"
    set fileNames to {"OfficeAdmin_AIVA_V3_Motion_Film.mp4", "OfficeAdmin_AIVA_V3_Motion_Vertical.mp4"}
    set mediaTitles to {"OfficeAdmin + AIVA - Widescreen (V3)", "OfficeAdmin + AIVA - Vertical (V3)"}
    set expectedWidths to {1920, 1080}
    set expectedHeights to {1080, 1920}
    set importFiles to {}
    repeat with fileName in fileNames
        set end of importFiles to (POSIX file (deliveryFolder & "/" & (fileName as text))) as alias
    end repeat
    set receipt to "ALBUM" & tab & albumTitle & linefeed
    with timeout of 180 seconds
        tell application "Photos"
            launch
            set foundAlbums to every album whose name is albumTitle
            if (count of foundAlbums) > 1 then error "Multiple V3 albums exist. Review before importing."
            if (count of foundAlbums) is 0 then
                set targetAlbum to make new album named albumTitle
            else
                set targetAlbum to item 1 of foundAlbums
            end if
            repeat with i from 1 to 2
                set expectedFile to item i of fileNames
                set matches to every media item of targetAlbum whose filename is expectedFile
                if (count of matches) is 0 then
                    set sourceFile to item i of importFiles
                    import {sourceFile} into targetAlbum skip check duplicates false
                    set matches to every media item of targetAlbum whose filename is expectedFile
                end if
                if (count of matches) is not 1 then error "Cannot uniquely verify: " & expectedFile
                set importedMovie to item 1 of matches
                if (width of importedMovie) is not (item i of expectedWidths) then error "Width mismatch: " & expectedFile
                if (height of importedMovie) is not (item i of expectedHeights) then error "Height mismatch: " & expectedFile
                set name of importedMovie to item i of mediaTitles
                set description of importedMovie to "90-second OfficeAdmin + AIVA V3 motion film. Actual rendered interface elements with fictional demo data and editorial animation."
                set receipt to receipt & expectedFile & tab & (id of importedMovie) & tab & ((width of importedMovie) as text) & "x" & ((height of importedMovie) as text) & linefeed
            end repeat
        end tell
    end timeout
    return receipt
end run
