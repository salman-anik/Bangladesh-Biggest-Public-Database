# Hadith Books

This folder contains the Hadith collection JSON files, with readable filenames.

## Main collections

Each file below contains a complete collection:

### The Nine Books

- `Sahih al-Bukhari.json`
- `Sahih Muslim.json`
- `Sunan Abi Dawud.json`
- `Jami al-Tirmidhi.json`
- `Sunan al-Nasa'i.json`
- `Sunan Ibn Majah.json`
- `Muwatta Malik.json`
- `Musnad Ahmad ibn Hanbal.json`
- `Sunan al-Darimi.json`

### Other Hadith books

- `Al-Adab al-Mufrad.json`
- `Bulugh al-Maram.json`
- `Mishkat al-Masabih.json`
- `Riyad as-Salihin.json`
- `Shama'il Muhammadiyah.json`

### Forty Hadith collections

- `Forty Hadith of Imam Nawawi.json`
- `Forty Hadith Qudsi.json`
- `Forty Hadith of Shah Waliullah.json`

## Supplemental Bukhari files

Files named `Supplemental Bukhari - <number> - <book name>.json` contain an
additional Sahih al-Bukhari source, split into its internal books. There are
97 book files, including two source books with no hadith records.

These are alternate-source records, not replacements for the main
`Sahih al-Bukhari.json`. Keep them separate: records with the same hadith
number may have different text or metadata.

## Data indexes and chapter files

- [`../index.json`](../index.json) is the master catalog for all Hadith
  collections and links to their book and chapter data.
- [`../Additional Sources/Bukhari/index.json`](../Additional%20Sources/Bukhari/index.json)
  catalogs the supplemental Bukhari books.
- Chapter-by-chapter files are stored separately under
  [`../by_chapter/`](../by_chapter/).

The collection and chapter JSON files retain their source-specific schemas;
field names and metadata can differ between datasets. The Nawawi Forty Hadith
chapter is included in its collection file and is not duplicated under
`by_chapter`.
