# Design: Kraefte-Druck und Personalstaerke

## Ziel

Die Kraefteuebersicht soll beim Drucken/PDF klar nach Einsatzabschnitten gegliedert sein und pro Abschnitt die Personalzahl eindeutig ausweisen. Zusaetzlich soll die Eingabe der Personalstaerke beim Anlegen und Bearbeiten einer Kraft intuitiv werden, ohne dass Anwender selbst das Format `F/U/M` tippen muessen.

## Bestehender Zustand

- Die Personalstaerke wird im Editor als freies Textfeld `staerke` gepflegt.
- Die Gesamtpersonenzahl wird aus einem String im Format `a/b/c` berechnet.
- Die Druckansicht der Kraefteuebersicht zeigt pro Einsatzabschnitt die Anzahl der Kraefte, aber nicht ausreichend prominent die zugeordnete Personalzahl und keine klare Gesamtsumme am Ende.

## Beschlossene Umsetzung

### 1. Personalstaerke im Editor

- Das freie Textfeld wird durch drei getrennte numerische Eingabefelder fuer `F`, `U` und `M` ersetzt.
- Beim Oeffnen des Editors wird ein bestehender `staerke`-String wie `1/3/18` automatisch in die drei Teilwerte zerlegt.
- Beim Speichern wird aus den drei Feldern wieder ein normalisierter String im bestehenden Format `F/U/M` erzeugt.
- Leere Teilwerte werden als `0` behandelt, damit die Eingabe robust und vorhersagbar bleibt.
- Unter den Eingabefeldern wird weiterhin direkt die berechnete Gesamtpersonenzahl angezeigt.

### 2. Druck/PDF der Kraefteuebersicht

- Die Druckansicht bleibt nach Einsatzabschnitten gegliedert.
- Im Kopf jedes Einsatzabschnitts werden angezeigt:
  - Leiter
  - Anzahl Kraefte
  - Anzahl Personal
- Die Liste der zugeordneten Kraefte bleibt tabellarisch.
- Falls es nicht zugeordnete Kraefte im Pool gibt, werden diese weiterhin separat ausgegeben.
- Am Ende der Druckansicht wird ein Summenblock eingefuegt mit:
  - Einsatzabschnitte gesamt
  - Zugeordnete Kraefte gesamt
  - Personal gesamt in Einsatzabschnitten
  - Optional Pool: Anzahl Kraefte und Personal im Pool
  - Gesamtpersonenzahl ueber alle Kraefte

## Datenmodell

- Das bestehende Feld `staerke` bleibt als kompatibler String erhalten.
- Neue dauerhafte Datenfelder sind nicht erforderlich.
- Fuer die Editorlogik werden nur temporaere abgeleitete Teilwerte fuer `F`, `U` und `M` verwendet.

## Auswirkungen auf bestehende Daten

- Bereits gespeicherte Kraefte mit `staerke` im Format `F/U/M` bleiben gueltig.
- Unvollstaendige oder fehlerhafte Eingaben werden defensiv behandelt und bei der Bearbeitung sinnvoll in Zahlenfelder ueberfuehrt.
- Vorlagen koennen unveraendert bleiben, da sie weiterhin den bestehenden `staerke`-String liefern.

## Fehlerbehandlung

- Nicht numerische Teilwerte werden im Editor nicht aktiv erzeugt.
- Beim Parsen bestehender Staerkeangaben werden ungueltige Bestandteile als `0` interpretiert.
- Eine leere Personalstaerke soll weiterhin zu `0` Personen fuehren.

## Tests

- Tests fuer Parsen und Normalisieren der Personalstaerke:
  - `1/3/18` wird korrekt zu Teilwerten und Gesamtzahl verarbeitet.
  - Leere oder ungueltige Eingaben ergeben `0`.
  - Drei Eingabefelder werden korrekt zu `F/U/M` zusammengesetzt.
- Tests fuer die Druckdatenaufbereitung:
  - Personen pro Einsatzabschnitt werden korrekt summiert.
  - Gesamtzahlen fuer Abschnitte, Pool und Gesamtsumme werden korrekt berechnet.

## Scope

In Scope:

- Editor fuer Kraefte
- Hilfslogik fuer Personalstaerke
- Druckansicht der Kraefteuebersicht
- Tests fuer die neue Logik

Out of Scope:

- Migration des Datenmodells auf ein Objekt statt String
- Aenderungen an anderen Druckansichten
- Allgemeine Ueberarbeitung des Layouts ausserhalb der Kraefte-Druckansicht
