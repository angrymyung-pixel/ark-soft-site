import importlib.util,json,os,tempfile,unittest
from pathlib import Path
from datetime import datetime
spec=importlib.util.spec_from_file_location('serial',Path(__file__).resolve().parents[1]/'scripts/build_serial.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class ReleaseTests(unittest.TestCase):
    def check(self,when,expected):
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)/'site';episodes=module.build(datetime.fromisoformat(when),out)
            self.assertEqual([e['id'] for e in episodes],expected)
            self.assertFalse((out/'.release').exists());self.assertFalse((out/'scripts').exists())
            for p in (out/'published').glob('*.json'):
                if p.name!='catalog.json':self.assertIn(p.stem,expected)
            self.assertNotIn('edition.enc',[p.name for p in out.rglob('*')])
    def test_before_first(self):self.check('2026-12-24T23:59:59+09:00',[])
    def test_first_midnight(self):self.check('2026-12-25T00:00:00+09:00',['1'])
    def test_second_midnight(self):self.check('2026-12-26T00:00:00+09:00',['1','2'])
    def test_third_midnight(self):self.check('2026-12-27T00:00:00+09:00',['1','2','3'])
    def test_new_year(self):self.check('2027-01-01T00:00:00+09:00',['1','2','3','4'])
    def test_fifth(self):self.check('2027-01-07T00:00:00+09:00',['1','2','3','4','5'])
    def test_weekly(self):self.check('2027-01-14T00:00:00+09:00',['1','2','3','4','5','6','6-2'])
    def test_final_draft_held(self):
        with tempfile.TemporaryDirectory() as tmp:
            es=module.build(datetime.fromisoformat('2030-01-01T00:00:00+09:00'),Path(tmp)/'site')
            self.assertEqual(len(es),40);self.assertNotIn('40',[e['id'] for e in es])
